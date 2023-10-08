function _check_private_redeclaration(obj, privateCollection) {
    if (privateCollection.has(obj)) {
        throw new TypeError("Cannot initialize the same private elements twice on an object");
    }
}
function _class_apply_descriptor_get(receiver, descriptor) {
    if (descriptor.get) {
        return descriptor.get.call(receiver);
    }
    return descriptor.value;
}
function _class_apply_descriptor_set(receiver, descriptor, value) {
    if (descriptor.set) {
        descriptor.set.call(receiver, value);
    } else {
        if (!descriptor.writable) {
            throw new TypeError("attempted to set read only private field");
        }
        descriptor.value = value;
    }
}
function _class_extract_field_descriptor(receiver, privateMap, action) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to " + action + " private field on non-instance");
    }
    return privateMap.get(receiver);
}
function _class_private_field_get(receiver, privateMap) {
    var descriptor = _class_extract_field_descriptor(receiver, privateMap, "get");
    return _class_apply_descriptor_get(receiver, descriptor);
}
function _class_private_field_init(obj, privateMap, value) {
    _check_private_redeclaration(obj, privateMap);
    privateMap.set(obj, value);
}
function _class_private_field_set(receiver, privateMap, value) {
    var descriptor = _class_extract_field_descriptor(receiver, privateMap, "set");
    _class_apply_descriptor_set(receiver, descriptor, value);
    return value;
}
function _class_private_method_get(receiver, privateSet, fn) {
    if (!privateSet.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return fn;
}
function _class_private_method_init(obj, privateSet) {
    _check_private_redeclaration(obj, privateSet);
    privateSet.add(obj);
}
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
import ObjectMultiplex from '@metamask/object-multiplex';
import { SNAP_STREAM_NAMES, logError } from '@metamask/snaps-utils';
import { Duration, isJsonRpcNotification, isObject } from '@metamask/utils';
import { JsonRpcEngine } from 'json-rpc-engine';
import { createStreamMiddleware } from 'json-rpc-middleware-stream';
import { nanoid } from 'nanoid';
import { pipeline } from 'stream';
import { log } from '../logging';
import { hasTimedOut, withTimeout } from '../utils';
const controllerName = 'ExecutionService';
var _snapRpcHooks = /*#__PURE__*/ new WeakMap(), _snapToJobMap = /*#__PURE__*/ new WeakMap(), _jobToSnapMap = /*#__PURE__*/ new WeakMap(), _messenger = /*#__PURE__*/ new WeakMap(), _terminationTimeout = /*#__PURE__*/ new WeakMap(), _removeSnapHooks = /*#__PURE__*/ new WeakSet(), _createSnapHooks = /*#__PURE__*/ new WeakSet(), _mapSnapAndJob = /*#__PURE__*/ new WeakSet(), _removeSnapAndJobMapping = /*#__PURE__*/ new WeakSet();
export class AbstractExecutionService {
    /**
   * Constructor helper for registering the controller's messaging system
   * actions.
   */ registerMessageHandlers() {
        _class_private_field_get(this, _messenger).registerActionHandler(`${controllerName}:handleRpcRequest`, async (snapId, options)=>this.handleRpcRequest(snapId, options));
        _class_private_field_get(this, _messenger).registerActionHandler(`${controllerName}:executeSnap`, async (snapData)=>this.executeSnap(snapData));
        _class_private_field_get(this, _messenger).registerActionHandler(`${controllerName}:terminateSnap`, async (snapId)=>this.terminateSnap(snapId));
        _class_private_field_get(this, _messenger).registerActionHandler(`${controllerName}:terminateAllSnaps`, async ()=>this.terminateAllSnaps());
    }
    /**
   * Terminates the job with the specified ID and deletes all its associated
   * data. Any subsequent messages targeting the job will fail with an error.
   * Throws an error if the specified job does not exist, or if termination
   * fails unexpectedly.
   *
   * @param jobId - The id of the job to be terminated.
   */ async terminate(jobId) {
        const jobWrapper = this.jobs.get(jobId);
        if (!jobWrapper) {
            throw new Error(`Job with id "${jobId}" not found.`);
        }
        // Ping worker and tell it to run teardown, continue with termination if it takes too long
        const result = await withTimeout(this.command(jobId, {
            jsonrpc: '2.0',
            method: 'terminate',
            params: [],
            id: nanoid()
        }), _class_private_field_get(this, _terminationTimeout));
        if (result === hasTimedOut || result !== 'OK') {
            // We tried to shutdown gracefully but failed. This probably means the Snap is in infinite loop and
            // hogging down the whole JS process.
            // TODO(ritave): It might be doing weird things such as posting a lot of setTimeouts. Add a test to ensure that this behaviour
            //               doesn't leak into other workers. Especially important in IframeExecutionEnvironment since they all share the same
            //               JS process.
            logError(`Job "${jobId}" failed to terminate gracefully.`, result);
        }
        Object.values(jobWrapper.streams).forEach((stream)=>{
            try {
                !stream.destroyed && stream.destroy();
                stream.removeAllListeners();
            } catch (error) {
                logError('Error while destroying stream', error);
            }
        });
        this.terminateJob(jobWrapper);
        _class_private_method_get(this, _removeSnapAndJobMapping, removeSnapAndJobMapping).call(this, jobId);
        this.jobs.delete(jobId);
        log(`Job "${jobId}" terminated.`);
    }
    /**
   * Initiates a job for a snap.
   *
   * Depending on the execution environment, this may run forever if the Snap fails to start up properly, therefore any call to this function should be wrapped in a timeout.
   *
   * @returns Information regarding the created job.
   */ async initJob() {
        const jobId = nanoid();
        const { streams, worker } = await this.initStreams(jobId);
        const rpcEngine = new JsonRpcEngine();
        const jsonRpcConnection = createStreamMiddleware();
        pipeline(jsonRpcConnection.stream, streams.command, jsonRpcConnection.stream, (error)=>{
            if (error) {
                logError(`Command stream failure.`, error);
            }
        });
        rpcEngine.push(jsonRpcConnection.middleware);
        const envMetadata = {
            id: jobId,
            streams,
            rpcEngine,
            worker
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
   */ async initStreams(jobId) {
        const { worker, stream: envStream } = await this.initEnvStream(jobId);
        // Typecast justification: stream type mismatch
        const mux = setupMultiplex(envStream, `Job: "${jobId}"`);
        const commandStream = mux.createStream(SNAP_STREAM_NAMES.COMMAND);
        // Handle out-of-band errors, i.e. errors thrown from the snap outside of the req/res cycle.
        // Also keep track of outbound request/responses
        const notificationHandler = (message)=>{
            if (!isJsonRpcNotification(message)) {
                return;
            }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const snapId = _class_private_field_get(this, _jobToSnapMap).get(jobId);
            if (message.method === 'OutboundRequest') {
                _class_private_field_get(this, _messenger).publish('ExecutionService:outboundRequest', snapId);
            } else if (message.method === 'OutboundResponse') {
                _class_private_field_get(this, _messenger).publish('ExecutionService:outboundResponse', snapId);
            } else if (message.method === 'UnhandledError') {
                if (isObject(message.params) && message.params.error) {
                    _class_private_field_get(this, _messenger).publish('ExecutionService:unhandledError', snapId, message.params.error);
                    commandStream.removeListener('data', notificationHandler);
                } else {
                    logError(new Error(`Received malformed "${message.method}" command stream notification.`));
                }
            } else {
                logError(new Error(`Received unexpected command stream notification "${message.method}".`));
            }
        };
        commandStream.on('data', notificationHandler);
        const rpcStream = mux.createStream(SNAP_STREAM_NAMES.JSON_RPC);
        // Typecast: stream type mismatch
        return {
            streams: {
                command: commandStream,
                rpc: rpcStream,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                _connection: envStream
            },
            worker
        };
    }
    /**
   * Terminates the Snap with the specified ID. May throw an error if
   * termination unexpectedly fails, but will not fail if no job for the snap
   * with the specified ID is found.
   *
   * @param snapId - The ID of the snap to terminate.
   */ async terminateSnap(snapId) {
        const jobId = _class_private_field_get(this, _snapToJobMap).get(snapId);
        if (jobId) {
            await this.terminate(jobId);
        }
    }
    async terminateAllSnaps() {
        await Promise.all([
            ...this.jobs.keys()
        ].map(async (jobId)=>this.terminate(jobId)));
        _class_private_field_get(this, _snapRpcHooks).clear();
    }
    /**
   * Gets the RPC request handler for the given snap.
   *
   * @param snapId - The id of the Snap whose message handler to get.
   * @returns The RPC request handler for the snap.
   */ getRpcRequestHandler(snapId) {
        return _class_private_field_get(this, _snapRpcHooks).get(snapId);
    }
    /**
   * Initializes and executes a snap, setting up the communication channels to the snap etc.
   *
   * Depending on the execution environment, this may run forever if the Snap fails to start up properly, therefore any call to this function should be wrapped in a timeout.
   *
   * @param snapData - Data needed for Snap execution.
   * @returns A string `OK` if execution succeeded.
   * @throws If the execution service returns an error.
   */ async executeSnap(snapData) {
        if (_class_private_field_get(this, _snapToJobMap).has(snapData.snapId)) {
            throw new Error(`Snap "${snapData.snapId}" is already being executed.`);
        }
        const job = await this.initJob();
        _class_private_method_get(this, _mapSnapAndJob, mapSnapAndJob).call(this, snapData.snapId, job.id);
        // Ping the worker to ensure that it started up
        await this.command(job.id, {
            jsonrpc: '2.0',
            method: 'ping',
            id: nanoid()
        });
        const rpcStream = job.streams.rpc;
        this.setupSnapProvider(snapData.snapId, rpcStream);
        const result = await this.command(job.id, {
            jsonrpc: '2.0',
            method: 'executeSnap',
            params: snapData,
            id: nanoid()
        });
        _class_private_method_get(this, _createSnapHooks, createSnapHooks).call(this, snapData.snapId, job.id);
        return result;
    }
    // Cannot be hash private yet because of tests.
    async command(jobId, message) {
        if (typeof message !== 'object') {
            throw new Error('Must send object.');
        }
        const job = this.jobs.get(jobId);
        if (!job) {
            throw new Error(`Job with id "${jobId}" not found.`);
        }
        log('Parent: Sending Command', message);
        const response = await job.rpcEngine.handle(message);
        if (response.error) {
            throw new Error(response.error.message);
        }
        return response.result;
    }
    /**
   * Handle RPC request.
   *
   * @param snapId - The ID of the recipient snap.
   * @param options - Bag of options to pass to the RPC handler.
   * @returns Promise that can handle the request.
   */ async handleRpcRequest(snapId, options) {
        const rpcRequestHandler = await this.getRpcRequestHandler(snapId);
        if (!rpcRequestHandler) {
            throw new Error(`Snap execution service returned no RPC handler for running snap "${snapId}".`);
        }
        return rpcRequestHandler(options);
    }
    constructor({ setupSnapProvider, messenger, terminationTimeout = Duration.Second }){
        _class_private_method_init(this, _removeSnapHooks);
        _class_private_method_init(this, _createSnapHooks);
        _class_private_method_init(this, _mapSnapAndJob);
        _class_private_method_init(this, _removeSnapAndJobMapping);
        _class_private_field_init(this, _snapRpcHooks, {
            writable: true,
            value: void 0
        });
        // Cannot be hash private yet because of tests.
        _define_property(this, "jobs", void 0);
        // Cannot be hash private yet because of tests.
        _define_property(this, "setupSnapProvider", void 0);
        _class_private_field_init(this, _snapToJobMap, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _jobToSnapMap, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _messenger, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _terminationTimeout, {
            writable: true,
            value: void 0
        });
        _class_private_field_set(this, _snapRpcHooks, new Map());
        this.jobs = new Map();
        this.setupSnapProvider = setupSnapProvider;
        _class_private_field_set(this, _snapToJobMap, new Map());
        _class_private_field_set(this, _jobToSnapMap, new Map());
        _class_private_field_set(this, _messenger, messenger);
        _class_private_field_set(this, _terminationTimeout, terminationTimeout);
        this.registerMessageHandlers();
    }
}
function removeSnapHooks(snapId) {
    _class_private_field_get(this, _snapRpcHooks).delete(snapId);
}
function createSnapHooks(snapId, workerId) {
    const rpcHook = async ({ origin, handler, request })=>{
        return await this.command(workerId, {
            id: nanoid(),
            jsonrpc: '2.0',
            method: 'snapRpc',
            params: {
                origin,
                handler,
                request,
                target: snapId
            }
        });
    };
    _class_private_field_get(this, _snapRpcHooks).set(snapId, rpcHook);
}
function mapSnapAndJob(snapId, jobId) {
    _class_private_field_get(this, _snapToJobMap).set(snapId, jobId);
    _class_private_field_get(this, _jobToSnapMap).set(jobId, snapId);
}
function removeSnapAndJobMapping(jobId) {
    const snapId = _class_private_field_get(this, _jobToSnapMap).get(jobId);
    if (!snapId) {
        throw new Error(`job: "${jobId}" has no mapped snap.`);
    }
    _class_private_field_get(this, _jobToSnapMap).delete(jobId);
    _class_private_field_get(this, _snapToJobMap).delete(snapId);
    _class_private_method_get(this, _removeSnapHooks, removeSnapHooks).call(this, snapId);
}
/**
 * Sets up stream multiplexing for the given stream.
 *
 * @param connectionStream - The stream to mux.
 * @param streamName - The name of the stream, for identification in errors.
 * @returns The multiplexed stream.
 */ export function setupMultiplex(connectionStream, streamName) {
    const mux = new ObjectMultiplex();
    pipeline(connectionStream, // Typecast: stream type mismatch
    mux, connectionStream, (error)=>{
        if (error) {
            streamName ? logError(`"${streamName}" stream failure.`, error) : logError(error);
        }
    });
    return mux;
}

//# sourceMappingURL=AbstractExecutionService.js.map