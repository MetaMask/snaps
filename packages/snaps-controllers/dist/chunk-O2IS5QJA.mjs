import {
  log
} from "./chunk-4HVWEABQ.mjs";
import {
  hasTimedOut,
  withTimeout
} from "./chunk-567BFPSL.mjs";
import {
  Timer
} from "./chunk-XO7KDFBY.mjs";
import {
  __privateAdd,
  __privateGet,
  __privateMethod,
  __privateSet
} from "./chunk-YRZVIDCF.mjs";

// src/services/AbstractExecutionService.ts
import { JsonRpcEngine } from "@metamask/json-rpc-engine";
import { createStreamMiddleware } from "@metamask/json-rpc-middleware-stream";
import ObjectMultiplex from "@metamask/object-multiplex";
import { JsonRpcError } from "@metamask/rpc-errors";
import { SNAP_STREAM_NAMES, logError } from "@metamask/snaps-utils";
import {
  Duration,
  assertIsJsonRpcRequest,
  inMilliseconds,
  isJsonRpcFailure,
  isJsonRpcNotification,
  isObject
} from "@metamask/utils";
import { nanoid } from "nanoid";
import { pipeline } from "readable-stream";
var controllerName = "ExecutionService";
var _snapRpcHooks, _snapToJobMap, _jobToSnapMap, _messenger, _initTimeout, _pingTimeout, _terminationTimeout, _usePing, _removeSnapHooks, removeSnapHooks_fn, _createSnapHooks, createSnapHooks_fn, _mapSnapAndJob, mapSnapAndJob_fn, _removeSnapAndJobMapping, removeSnapAndJobMapping_fn;
var AbstractExecutionService = class {
  constructor({
    setupSnapProvider,
    messenger,
    initTimeout = inMilliseconds(60, Duration.Second),
    pingTimeout = inMilliseconds(2, Duration.Second),
    terminationTimeout = inMilliseconds(1, Duration.Second),
    usePing = true
  }) {
    __privateAdd(this, _removeSnapHooks);
    __privateAdd(this, _createSnapHooks);
    __privateAdd(this, _mapSnapAndJob);
    __privateAdd(this, _removeSnapAndJobMapping);
    __privateAdd(this, _snapRpcHooks, void 0);
    __privateAdd(this, _snapToJobMap, void 0);
    __privateAdd(this, _jobToSnapMap, void 0);
    __privateAdd(this, _messenger, void 0);
    __privateAdd(this, _initTimeout, void 0);
    __privateAdd(this, _pingTimeout, void 0);
    __privateAdd(this, _terminationTimeout, void 0);
    __privateAdd(this, _usePing, void 0);
    __privateSet(this, _snapRpcHooks, /* @__PURE__ */ new Map());
    this.jobs = /* @__PURE__ */ new Map();
    this.setupSnapProvider = setupSnapProvider;
    __privateSet(this, _snapToJobMap, /* @__PURE__ */ new Map());
    __privateSet(this, _jobToSnapMap, /* @__PURE__ */ new Map());
    __privateSet(this, _messenger, messenger);
    __privateSet(this, _initTimeout, initTimeout);
    __privateSet(this, _pingTimeout, pingTimeout);
    __privateSet(this, _terminationTimeout, terminationTimeout);
    __privateSet(this, _usePing, usePing);
    this.registerMessageHandlers();
  }
  /**
   * Constructor helper for registering the controller's messaging system
   * actions.
   */
  registerMessageHandlers() {
    __privateGet(this, _messenger).registerActionHandler(
      `${controllerName}:handleRpcRequest`,
      async (snapId, options) => this.handleRpcRequest(snapId, options)
    );
    __privateGet(this, _messenger).registerActionHandler(
      `${controllerName}:executeSnap`,
      async (data) => this.executeSnap(data)
    );
    __privateGet(this, _messenger).registerActionHandler(
      `${controllerName}:terminateSnap`,
      async (snapId) => this.terminateSnap(snapId)
    );
    __privateGet(this, _messenger).registerActionHandler(
      `${controllerName}:terminateAllSnaps`,
      async () => this.terminateAllSnaps()
    );
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
    try {
      const result = await withTimeout(
        this.command(jobId, {
          jsonrpc: "2.0",
          method: "terminate",
          params: [],
          id: nanoid()
        }),
        __privateGet(this, _terminationTimeout)
      );
      if (result === hasTimedOut || result !== "OK") {
        logError(`Job "${jobId}" failed to terminate gracefully.`, result);
      }
    } catch {
    }
    Object.values(jobWrapper.streams).forEach((stream) => {
      try {
        !stream.destroyed && stream.destroy();
        stream.removeAllListeners();
      } catch (error) {
        logError("Error while destroying stream", error);
      }
    });
    this.terminateJob(jobWrapper);
    this.jobs.delete(jobId);
    __privateMethod(this, _removeSnapAndJobMapping, removeSnapAndJobMapping_fn).call(this, jobId);
    log(`Job "${jobId}" terminated.`);
  }
  /**
   * Initiates a job for a snap.
   *
   * @param jobId - The ID of the job to initiate.
   * @param timer - The timer to use for timeouts.
   * @returns Information regarding the created job.
   * @throws If the execution service returns an error or execution times out.
   */
  async initJob(jobId, timer) {
    const { streams, worker } = await this.initStreams(jobId, timer);
    const rpcEngine = new JsonRpcEngine();
    const jsonRpcConnection = createStreamMiddleware();
    pipeline(
      jsonRpcConnection.stream,
      streams.command,
      jsonRpcConnection.stream,
      (error) => {
        if (error) {
          logError(`Command stream failure.`, error);
        }
      }
    );
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
   * @param jobId - The id of the job.
   * @param timer - The timer to use for timeouts.
   * @returns The streams to communicate with the worker and the worker itself.
   * @throws If the execution service returns an error or execution times out.
   */
  async initStreams(jobId, timer) {
    const result = await withTimeout(this.initEnvStream(jobId), timer);
    if (result === hasTimedOut) {
      this.terminateJob({ id: jobId });
      throw new Error("The Snaps execution environment failed to start.");
    }
    const { worker, stream: envStream } = result;
    const mux = setupMultiplex(envStream, `Job: "${jobId}"`);
    const commandStream = mux.createStream(SNAP_STREAM_NAMES.COMMAND);
    const notificationHandler = (message) => {
      if (!isJsonRpcNotification(message)) {
        return;
      }
      const snapId = __privateGet(this, _jobToSnapMap).get(jobId);
      if (message.method === "OutboundRequest") {
        __privateGet(this, _messenger).publish("ExecutionService:outboundRequest", snapId);
      } else if (message.method === "OutboundResponse") {
        __privateGet(this, _messenger).publish("ExecutionService:outboundResponse", snapId);
      } else if (message.method === "UnhandledError") {
        if (isObject(message.params) && message.params.error) {
          __privateGet(this, _messenger).publish(
            "ExecutionService:unhandledError",
            snapId,
            message.params.error
          );
          commandStream.removeListener("data", notificationHandler);
        } else {
          logError(
            new Error(
              `Received malformed "${message.method}" command stream notification.`
            )
          );
        }
      } else {
        logError(
          new Error(
            `Received unexpected command stream notification "${message.method}".`
          )
        );
      }
    };
    commandStream.on("data", notificationHandler);
    const rpcStream = mux.createStream(SNAP_STREAM_NAMES.JSON_RPC);
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
   */
  async terminateSnap(snapId) {
    const jobId = __privateGet(this, _snapToJobMap).get(snapId);
    if (jobId) {
      await this.terminate(jobId);
    }
  }
  async terminateAllSnaps() {
    await Promise.all(
      [...this.jobs.keys()].map(async (jobId) => this.terminate(jobId))
    );
    __privateGet(this, _snapRpcHooks).clear();
  }
  /**
   * Gets the RPC request handler for the given snap.
   *
   * @param snapId - The id of the Snap whose message handler to get.
   * @returns The RPC request handler for the snap.
   */
  getRpcRequestHandler(snapId) {
    return __privateGet(this, _snapRpcHooks).get(snapId);
  }
  /**
   * Initializes and executes a snap, setting up the communication channels to the snap etc.
   *
   * @param snapData - Data needed for Snap execution.
   * @param snapData.snapId - The ID of the Snap to execute.
   * @param snapData.sourceCode - The source code of the Snap to execute.
   * @param snapData.endowments - The endowments available to the executing Snap.
   * @returns A string `OK` if execution succeeded.
   * @throws If the execution service returns an error or execution times out.
   */
  async executeSnap({
    snapId,
    sourceCode,
    endowments
  }) {
    if (__privateGet(this, _snapToJobMap).has(snapId)) {
      throw new Error(`Snap "${snapId}" is already being executed.`);
    }
    const jobId = nanoid();
    const timer = new Timer(__privateGet(this, _initTimeout));
    const job = await this.initJob(jobId, timer);
    __privateMethod(this, _mapSnapAndJob, mapSnapAndJob_fn).call(this, snapId, job.id);
    if (__privateGet(this, _usePing)) {
      const pingResult = await withTimeout(
        this.command(job.id, {
          jsonrpc: "2.0",
          method: "ping",
          id: nanoid()
        }),
        __privateGet(this, _pingTimeout)
      );
      if (pingResult === hasTimedOut) {
        throw new Error("The Snaps execution environment failed to start.");
      }
    }
    const rpcStream = job.streams.rpc;
    this.setupSnapProvider(snapId, rpcStream);
    const remainingTime = timer.remaining;
    const result = await withTimeout(
      this.command(job.id, {
        jsonrpc: "2.0",
        method: "executeSnap",
        params: { snapId, sourceCode, endowments },
        id: nanoid()
      }),
      remainingTime
    );
    if (result === hasTimedOut) {
      throw new Error(`${snapId} failed to start.`);
    }
    __privateMethod(this, _createSnapHooks, createSnapHooks_fn).call(this, snapId, job.id);
    return result;
  }
  // Cannot be hash private yet because of tests.
  async command(jobId, message) {
    assertIsJsonRpcRequest(message);
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job with id "${jobId}" not found.`);
    }
    log("Parent: Sending Command", message);
    const response = await job.rpcEngine.handle(message);
    if (isJsonRpcFailure(response)) {
      throw new JsonRpcError(
        response.error.code,
        response.error.message,
        response.error.data
      );
    }
    return response.result;
  }
  /**
   * Handle RPC request.
   *
   * @param snapId - The ID of the recipient snap.
   * @param options - Bag of options to pass to the RPC handler.
   * @returns Promise that can handle the request.
   */
  async handleRpcRequest(snapId, options) {
    const rpcRequestHandler = this.getRpcRequestHandler(snapId);
    if (!rpcRequestHandler) {
      throw new Error(
        `Snap execution service returned no RPC handler for running snap "${snapId}".`
      );
    }
    return rpcRequestHandler(options);
  }
};
_snapRpcHooks = new WeakMap();
_snapToJobMap = new WeakMap();
_jobToSnapMap = new WeakMap();
_messenger = new WeakMap();
_initTimeout = new WeakMap();
_pingTimeout = new WeakMap();
_terminationTimeout = new WeakMap();
_usePing = new WeakMap();
_removeSnapHooks = new WeakSet();
removeSnapHooks_fn = function(snapId) {
  __privateGet(this, _snapRpcHooks).delete(snapId);
};
_createSnapHooks = new WeakSet();
createSnapHooks_fn = function(snapId, workerId) {
  const rpcHook = async ({ origin, handler, request }) => {
    return await this.command(workerId, {
      id: nanoid(),
      jsonrpc: "2.0",
      method: "snapRpc",
      params: {
        origin,
        handler,
        request,
        target: snapId
      }
    });
  };
  __privateGet(this, _snapRpcHooks).set(snapId, rpcHook);
};
_mapSnapAndJob = new WeakSet();
mapSnapAndJob_fn = function(snapId, jobId) {
  __privateGet(this, _snapToJobMap).set(snapId, jobId);
  __privateGet(this, _jobToSnapMap).set(jobId, snapId);
};
_removeSnapAndJobMapping = new WeakSet();
removeSnapAndJobMapping_fn = function(jobId) {
  const snapId = __privateGet(this, _jobToSnapMap).get(jobId);
  if (!snapId) {
    throw new Error(`job: "${jobId}" has no mapped snap.`);
  }
  __privateGet(this, _jobToSnapMap).delete(jobId);
  __privateGet(this, _snapToJobMap).delete(snapId);
  __privateMethod(this, _removeSnapHooks, removeSnapHooks_fn).call(this, snapId);
};
function setupMultiplex(connectionStream, streamName) {
  const mux = new ObjectMultiplex();
  pipeline(connectionStream, mux, connectionStream, (error) => {
    if (error) {
      streamName ? logError(`"${streamName}" stream failure.`, error) : logError(error);
    }
  });
  return mux;
}

export {
  AbstractExecutionService,
  setupMultiplex
};
//# sourceMappingURL=chunk-O2IS5QJA.mjs.map