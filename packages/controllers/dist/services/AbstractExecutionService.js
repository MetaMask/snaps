"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupMultiplex = exports.AbstractExecutionService = void 0;
const object_multiplex_1 = __importDefault(require("@metamask/object-multiplex"));
const snap_utils_1 = require("@metamask/snap-utils");
const utils_1 = require("@metamask/utils");
const json_rpc_engine_1 = require("json-rpc-engine");
const nanoid_1 = require("nanoid");
const pump_1 = __importDefault(require("pump"));
const json_rpc_middleware_stream_1 = require("json-rpc-middleware-stream");
const utils_2 = require("../utils");
const controllerName = 'ExecutionService';
class AbstractExecutionService {
    constructor({ setupSnapProvider, messenger, terminationTimeout = utils_1.Duration.Second, }) {
        this._snapRpcHooks = new Map();
        this.jobs = new Map();
        this.setupSnapProvider = setupSnapProvider;
        this.snapToJobMap = new Map();
        this.jobToSnapMap = new Map();
        this._messenger = messenger;
        this._terminationTimeout = terminationTimeout;
        this.registerMessageHandlers();
    }
    /**
     * Constructor helper for registering the controller's messaging system
     * actions.
     */
    registerMessageHandlers() {
        this._messenger.registerActionHandler(`${controllerName}:handleRpcRequest`, (snapId, options) => this.handleRpcRequest(snapId, options));
        this._messenger.registerActionHandler(`${controllerName}:executeSnap`, (snapData) => this.executeSnap(snapData));
        this._messenger.registerActionHandler(`${controllerName}:terminateSnap`, (snapId) => this.terminateSnap(snapId));
        this._messenger.registerActionHandler(`${controllerName}:terminateAllSnaps`, () => this.terminateAllSnaps());
    }
    /**
     * Terminates the job with the specified ID and deletes all its associated
     * data. Any subsequent messages targeting the job will fail with an error.
     * Throws an error if the specified job does not exist, or if termination
     * fails unexpectedly.
     *
     * @param jobId - The id of the job to be terminated.
     */
    async terminate(jobId) {
        const jobWrapper = this.jobs.get(jobId);
        if (!jobWrapper) {
            throw new Error(`Job with id "${jobId}" not found.`);
        }
        // Ping worker and tell it to run teardown, continue with termination if it takes too long
        const result = await (0, utils_2.withTimeout)(this._command(jobId, {
            jsonrpc: '2.0',
            method: 'terminate',
            params: [],
            id: (0, nanoid_1.nanoid)(),
        }), this._terminationTimeout);
        if (result === utils_2.hasTimedOut || result !== 'OK') {
            // We tried to shutdown gracefully but failed. This probably means the Snap is in infite loop and
            // hogging down the whole JS process.
            // TODO(ritave): It might be doing weird things such as posting a lot of setTimeouts. Add a test to ensure that this behaviour
            //               doesn't leak into other workers. Especially important in IframeExecutionEnvironment since they all share the same
            //               JS process.
            console.error(`Job "${jobId}" failed to terminate gracefully.`, result);
        }
        Object.values(jobWrapper.streams).forEach((stream) => {
            try {
                !stream.destroyed && stream.destroy();
                stream.removeAllListeners();
            }
            catch (err) {
                console.error('Error while destroying stream', err);
            }
        });
        this._terminate(jobWrapper);
        this._removeSnapAndJobMapping(jobId);
        this.jobs.delete(jobId);
        console.log(`Job "${jobId}" terminated.`);
    }
    /**
     * Initiates a job for a snap.
     *
     * Depending on the execution environment, this may run forever if the Snap fails to start up properly, therefore any call to this function should be wrapped in a timeout.
     *
     * @returns Information regarding the created job.
     */
    async _initJob() {
        const jobId = (0, nanoid_1.nanoid)();
        const { streams, worker } = await this._initStreams(jobId);
        const rpcEngine = new json_rpc_engine_1.JsonRpcEngine();
        const jsonRpcConnection = (0, json_rpc_middleware_stream_1.createStreamMiddleware)();
        (0, pump_1.default)(jsonRpcConnection.stream, streams.command, jsonRpcConnection.stream);
        rpcEngine.push(jsonRpcConnection.middleware);
        const envMetadata = {
            id: jobId,
            streams,
            rpcEngine,
            worker,
        };
        this.jobs.set(jobId, envMetadata);
        return envMetadata;
    }
    /**
     * Sets up the streams for an initiated job.
     *
     * Depending on the execution environment, this may run forever if the Snap fails to start up properly, therefore any call to this function should be wrapped in a timeout.
     *
     * @param jobId - The id of the job.
     * @returns The streams to communicate with the worker and the worker itself.
     */
    async _initStreams(jobId) {
        const { worker, stream: envStream } = await this._initEnvStream(jobId);
        // Typecast justification: stream type mismatch
        const mux = setupMultiplex(envStream, `Job: "${jobId}"`);
        const commandStream = mux.createStream(snap_utils_1.SNAP_STREAM_NAMES.COMMAND);
        // Handle out-of-band errors, i.e. errors thrown from the snap outside of the req/res cycle.
        // Also keep track of outbound request/responses
        const notificationHandler = (message) => {
            if (!(0, utils_1.isJsonRpcNotification)(message)) {
                return;
            }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const snapId = this.jobToSnapMap.get(jobId);
            if (message.method === 'OutboundRequest') {
                this._messenger.publish('ExecutionService:outboundRequest', snapId);
            }
            else if (message.method === 'OutboundResponse') {
                this._messenger.publish('ExecutionService:outboundResponse', snapId);
            }
            else if (message.method === 'UnhandledError') {
                if ((0, utils_1.isObject)(message.params) && message.params.error) {
                    this._messenger.publish('ExecutionService:unhandledError', snapId, message.params.error);
                    commandStream.removeListener('data', notificationHandler);
                }
                else {
                    console.error(new Error(`Received malformed "${message.method}" command stream notification.`));
                }
            }
            else {
                console.error(new Error(`Received unexpected command stream notification "${message.method}".`));
            }
        };
        commandStream.on('data', notificationHandler);
        const rpcStream = mux.createStream(snap_utils_1.SNAP_STREAM_NAMES.JSON_RPC);
        // Typecast: stream type mismatch
        return {
            streams: {
                command: commandStream,
                rpc: rpcStream,
                _connection: envStream,
            },
            worker,
        };
    }
    /**
     * Terminates the Snap with the specified ID. May throw an error if
     * termination unexpectedly fails, but will not fail if no job for the snap
     * with the specified ID is found.
     *
     * @param snapId - The ID of the snap to terminate.
     */
    async terminateSnap(snapId) {
        const jobId = this.snapToJobMap.get(snapId);
        if (jobId) {
            await this.terminate(jobId);
        }
    }
    async terminateAllSnaps() {
        await Promise.all([...this.jobs.keys()].map((jobId) => this.terminate(jobId)));
        this._snapRpcHooks.clear();
    }
    /**
     * Gets the RPC request handler for the given snap.
     *
     * @param snapId - The id of the Snap whose message handler to get.
     * @returns The RPC request handler for the snap.
     */
    async getRpcRequestHandler(snapId) {
        return this._snapRpcHooks.get(snapId);
    }
    /**
     * Initializes and executes a snap, setting up the communication channels to the snap etc.
     *
     * Depending on the execution environment, this may run forever if the Snap fails to start up properly, therefore any call to this function should be wrapped in a timeout.
     *
     * @param snapData - Data needed for Snap execution.
     * @returns A string `OK` if execution succeeded.
     * @throws If the execution service returns an error.
     */
    async executeSnap(snapData) {
        if (this.snapToJobMap.has(snapData.snapId)) {
            throw new Error(`Snap "${snapData.snapId}" is already being executed.`);
        }
        const job = await this._initJob();
        this._mapSnapAndJob(snapData.snapId, job.id);
        // Ping the worker to ensure that it started up
        await this._command(job.id, {
            jsonrpc: '2.0',
            method: 'ping',
            id: (0, nanoid_1.nanoid)(),
        });
        const rpcStream = job.streams.rpc;
        this.setupSnapProvider(snapData.snapId, rpcStream);
        const result = await this._command(job.id, {
            jsonrpc: '2.0',
            method: 'executeSnap',
            params: snapData,
            id: (0, nanoid_1.nanoid)(),
        });
        this._createSnapHooks(snapData.snapId, job.id);
        return result;
    }
    async _command(jobId, message) {
        if (typeof message !== 'object') {
            throw new Error('Must send object.');
        }
        const job = this.jobs.get(jobId);
        if (!job) {
            throw new Error(`Job with id "${jobId}" not found.`);
        }
        console.log('Parent: Sending Command', message);
        const response = await job.rpcEngine.handle(message);
        if (response.error) {
            throw new Error(response.error.message);
        }
        return response.result;
    }
    _removeSnapHooks(snapId) {
        this._snapRpcHooks.delete(snapId);
    }
    _createSnapHooks(snapId, workerId) {
        const rpcHook = async ({ origin, handler, request }) => {
            return await this._command(workerId, {
                id: (0, nanoid_1.nanoid)(),
                jsonrpc: '2.0',
                method: 'snapRpc',
                params: {
                    origin,
                    handler,
                    request,
                    target: snapId,
                },
            });
        };
        this._snapRpcHooks.set(snapId, rpcHook);
    }
    /**
     * Gets the job id for a given snap.
     *
     * @param snapId - A given snap id.
     * @returns The ID of the snap's job.
     */
    _getJobForSnap(snapId) {
        return this.snapToJobMap.get(snapId);
    }
    /**
     * Gets the snap id for a given job.
     *
     * @param jobId - A given job id.
     * @returns The ID of the snap that is running the job.
     */
    _getSnapForJob(jobId) {
        return this.jobToSnapMap.get(jobId);
    }
    _mapSnapAndJob(snapId, jobId) {
        this.snapToJobMap.set(snapId, jobId);
        this.jobToSnapMap.set(jobId, snapId);
    }
    _removeSnapAndJobMapping(jobId) {
        const snapId = this.jobToSnapMap.get(jobId);
        if (!snapId) {
            throw new Error(`job: "${jobId}" has no mapped snap.`);
        }
        this.jobToSnapMap.delete(jobId);
        this.snapToJobMap.delete(snapId);
        this._removeSnapHooks(snapId);
    }
    /**
     * Handle RPC request.
     *
     * @param snapId - The ID of the recipient snap.
     * @param options - Bag of options to pass to the RPC handler.
     * @returns Promise that can handle the request.
     */
    async handleRpcRequest(snapId, options) {
        const rpcRequestHandler = await this.getRpcRequestHandler(snapId);
        if (!rpcRequestHandler) {
            throw new Error(`Snap execution service returned no RPC handler for running snap "${snapId}".`);
        }
        return rpcRequestHandler(options);
    }
}
exports.AbstractExecutionService = AbstractExecutionService;
/**
 * Sets up stream multiplexing for the given stream.
 *
 * @param connectionStream - The stream to mux.
 * @param streamName - The name of the stream, for identification in errors.
 * @returns The multiplexed stream.
 */
function setupMultiplex(connectionStream, streamName) {
    const mux = new object_multiplex_1.default();
    (0, pump_1.default)(connectionStream, 
    // Typecast: stream type mismatch
    mux, connectionStream, (err) => {
        if (err) {
            streamName
                ? console.error(`"${streamName}" stream failure.`, err)
                : console.error(err);
        }
    });
    return mux;
}
exports.setupMultiplex = setupMultiplex;
//# sourceMappingURL=AbstractExecutionService.js.map