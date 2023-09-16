import ObjectMultiplex from '@metamask/object-multiplex';
import type { BasePostMessageStream } from '@metamask/post-message-stream';
import type { SnapRpcHook, SnapRpcHookArgs } from '@metamask/snaps-utils';
import { SNAP_STREAM_NAMES, logError } from '@metamask/snaps-utils';
import type { Json, JsonRpcNotification } from '@metamask/utils';
import { Duration, isJsonRpcNotification, isObject } from '@metamask/utils';
import type {
  // TODO: Replace with @metamask/utils version after bumping json-rpc-engine
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from 'json-rpc-engine';
import { JsonRpcEngine } from 'json-rpc-engine';
import { createStreamMiddleware } from 'json-rpc-middleware-stream';
import { nanoid } from 'nanoid';
import pump from 'pump';
import type { Duplex } from 'stream';

import { log } from '../logging';
import { hasTimedOut, withTimeout } from '../utils';
import type {
  ExecutionService,
  ExecutionServiceMessenger,
  SnapErrorJson,
  SnapExecutionData,
} from './ExecutionService';

const controllerName = 'ExecutionService';

export type SetupSnapProvider = (snapId: string, stream: Duplex) => void;

export type ExecutionServiceArgs = {
  setupSnapProvider: SetupSnapProvider;
  messenger: ExecutionServiceMessenger;
  terminationTimeout?: number;
};

export type JobStreams = {
  command: Duplex;
  rpc: Duplex;
  _connection: BasePostMessageStream;
};

export type Job<WorkerType> = {
  id: string;
  streams: JobStreams;
  rpcEngine: JsonRpcEngine;
  worker: WorkerType;
};

export abstract class AbstractExecutionService<WorkerType>
  implements ExecutionService
{
  #snapRpcHooks: Map<string, SnapRpcHook>;

  // Cannot be hash private yet because of tests.
  protected jobs: Map<string, Job<WorkerType>>;

  // Cannot be hash private yet because of tests.
  private readonly setupSnapProvider: SetupSnapProvider;

  #snapToJobMap: Map<string, string>;

  #jobToSnapMap: Map<string, string>;

  #messenger: ExecutionServiceMessenger;

  #terminationTimeout: number;

  constructor({
    setupSnapProvider,
    messenger,
    terminationTimeout = Duration.Second,
  }: ExecutionServiceArgs) {
    this.#snapRpcHooks = new Map();
    this.jobs = new Map();
    this.setupSnapProvider = setupSnapProvider;
    this.#snapToJobMap = new Map();
    this.#jobToSnapMap = new Map();
    this.#messenger = messenger;
    this.#terminationTimeout = terminationTimeout;

    this.registerMessageHandlers();
  }

  /**
   * Constructor helper for registering the controller's messaging system
   * actions.
   */
  private registerMessageHandlers(): void {
    this.#messenger.registerActionHandler(
      `${controllerName}:handleRpcRequest`,
      async (snapId: string, options: SnapRpcHookArgs) =>
        this.handleRpcRequest(snapId, options),
    );

    this.#messenger.registerActionHandler(
      `${controllerName}:executeSnap`,
      async (snapData: SnapExecutionData) => this.executeSnap(snapData),
    );

    this.#messenger.registerActionHandler(
      `${controllerName}:terminateSnap`,
      async (snapId: string) => this.terminateSnap(snapId),
    );

    this.#messenger.registerActionHandler(
      `${controllerName}:terminateAllSnaps`,
      async () => this.terminateAllSnaps(),
    );
  }

  /**
   * Performs additional necessary work during job termination. **MUST** be
   * implemented by concrete implementations. See
   * {@link AbstractExecutionService.terminate} for details.
   *
   * @param job - The object corresponding to the job to be terminated.
   */
  protected abstract terminateJob(job: Job<WorkerType>): void;

  /**
   * Terminates the job with the specified ID and deletes all its associated
   * data. Any subsequent messages targeting the job will fail with an error.
   * Throws an error if the specified job does not exist, or if termination
   * fails unexpectedly.
   *
   * @param jobId - The id of the job to be terminated.
   */
  public async terminate(jobId: string): Promise<void> {
    const jobWrapper = this.jobs.get(jobId);
    if (!jobWrapper) {
      throw new Error(`Job with id "${jobId}" not found.`);
    }

    // Ping worker and tell it to run teardown, continue with termination if it takes too long
    const result = await withTimeout(
      this.command(jobId, {
        jsonrpc: '2.0',
        method: 'terminate',
        params: [],
        id: nanoid(),
      }),
      this.#terminationTimeout,
    );

    if (result === hasTimedOut || result !== 'OK') {
      // We tried to shutdown gracefully but failed. This probably means the Snap is in infinite loop and
      // hogging down the whole JS process.
      // TODO(ritave): It might be doing weird things such as posting a lot of setTimeouts. Add a test to ensure that this behaviour
      //               doesn't leak into other workers. Especially important in IframeExecutionEnvironment since they all share the same
      //               JS process.
      logError(`Job "${jobId}" failed to terminate gracefully.`, result);
    }

    Object.values(jobWrapper.streams).forEach((stream) => {
      try {
        !stream.destroyed && stream.destroy();
        stream.removeAllListeners();
      } catch (error) {
        logError('Error while destroying stream', error);
      }
    });

    this.terminateJob(jobWrapper);

    this.#removeSnapAndJobMapping(jobId);
    this.jobs.delete(jobId);
    log(`Job "${jobId}" terminated.`);
  }

  /**
   * Initiates a job for a snap.
   *
   * Depending on the execution environment, this may run forever if the Snap fails to start up properly, therefore any call to this function should be wrapped in a timeout.
   *
   * @returns Information regarding the created job.
   */
  protected async initJob(): Promise<Job<WorkerType>> {
    const jobId = nanoid();
    const { streams, worker } = await this.initStreams(jobId);
    const rpcEngine = new JsonRpcEngine();

    const jsonRpcConnection = createStreamMiddleware();

    pump(jsonRpcConnection.stream, streams.command, jsonRpcConnection.stream);

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
  protected async initStreams(
    jobId: string,
  ): Promise<{ streams: JobStreams; worker: WorkerType }> {
    const { worker, stream: envStream } = await this.initEnvStream(jobId);
    // Typecast justification: stream type mismatch
    const mux = setupMultiplex(
      envStream as unknown as Duplex,
      `Job: "${jobId}"`,
    );

    const commandStream = mux.createStream(SNAP_STREAM_NAMES.COMMAND);

    // Handle out-of-band errors, i.e. errors thrown from the snap outside of the req/res cycle.
    // Also keep track of outbound request/responses
    const notificationHandler = (
      message:
        | JsonRpcRequest<unknown>
        | JsonRpcNotification<Json[] | Record<string, Json>>,
    ) => {
      if (!isJsonRpcNotification(message)) {
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const snapId = this.#jobToSnapMap.get(jobId)!;
      if (message.method === 'OutboundRequest') {
        this.#messenger.publish('ExecutionService:outboundRequest', snapId);
      } else if (message.method === 'OutboundResponse') {
        this.#messenger.publish('ExecutionService:outboundResponse', snapId);
      } else if (message.method === 'UnhandledError') {
        if (isObject(message.params) && message.params.error) {
          this.#messenger.publish(
            'ExecutionService:unhandledError',
            snapId,
            message.params.error as SnapErrorJson,
          );
          commandStream.removeListener('data', notificationHandler);
        } else {
          logError(
            new Error(
              `Received malformed "${message.method}" command stream notification.`,
            ),
          );
        }
      } else {
        logError(
          new Error(
            `Received unexpected command stream notification "${message.method}".`,
          ),
        );
      }
    };

    commandStream.on('data', notificationHandler);
    const rpcStream = mux.createStream(SNAP_STREAM_NAMES.JSON_RPC);

    // Typecast: stream type mismatch
    return {
      streams: {
        command: commandStream as unknown as Duplex,
        rpc: rpcStream,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _connection: envStream,
      },
      worker,
    };
  }

  /**
   * Abstract function implemented by implementing class that spins up a new worker for a job.
   *
   * Depending on the execution environment, this may run forever if the Snap fails to start up properly, therefore any call to this function should be wrapped in a timeout.
   */
  protected abstract initEnvStream(jobId: string): Promise<{
    worker: WorkerType;
    stream: BasePostMessageStream;
  }>;

  /**
   * Terminates the Snap with the specified ID. May throw an error if
   * termination unexpectedly fails, but will not fail if no job for the snap
   * with the specified ID is found.
   *
   * @param snapId - The ID of the snap to terminate.
   */
  async terminateSnap(snapId: string) {
    const jobId = this.#snapToJobMap.get(snapId);
    if (jobId) {
      await this.terminate(jobId);
    }
  }

  async terminateAllSnaps() {
    await Promise.all(
      [...this.jobs.keys()].map(async (jobId) => this.terminate(jobId)),
    );
    this.#snapRpcHooks.clear();
  }

  /**
   * Gets the RPC request handler for the given snap.
   *
   * @param snapId - The id of the Snap whose message handler to get.
   * @returns The RPC request handler for the snap.
   */
  private getRpcRequestHandler(snapId: string) {
    return this.#snapRpcHooks.get(snapId);
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
  async executeSnap(snapData: SnapExecutionData): Promise<string> {
    if (this.#snapToJobMap.has(snapData.snapId)) {
      throw new Error(`Snap "${snapData.snapId}" is already being executed.`);
    }

    const job = await this.initJob();
    this.#mapSnapAndJob(snapData.snapId, job.id);

    // Ping the worker to ensure that it started up
    await this.command(job.id, {
      jsonrpc: '2.0',
      method: 'ping',
      id: nanoid(),
    });

    const rpcStream = job.streams.rpc as unknown as Duplex;

    this.setupSnapProvider(snapData.snapId, rpcStream);

    const result = await this.command(job.id, {
      jsonrpc: '2.0',
      method: 'executeSnap',
      params: snapData,
      id: nanoid(),
    });
    this.#createSnapHooks(snapData.snapId, job.id);
    return result as string;
  }

  // Cannot be hash private yet because of tests.
  private async command(
    jobId: string,
    message: JsonRpcRequest<unknown>,
  ): Promise<unknown> {
    if (typeof message !== 'object') {
      throw new Error('Must send object.');
    }

    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job with id "${jobId}" not found.`);
    }

    log('Parent: Sending Command', message);
    const response: PendingJsonRpcResponse<unknown> =
      await job.rpcEngine.handle(message);
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.result;
  }

  #removeSnapHooks(snapId: string) {
    this.#snapRpcHooks.delete(snapId);
  }

  #createSnapHooks(snapId: string, workerId: string) {
    const rpcHook = async ({ origin, handler, request }: SnapRpcHookArgs) => {
      return await this.command(workerId, {
        id: nanoid(),
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

    this.#snapRpcHooks.set(snapId, rpcHook);
  }

  #mapSnapAndJob(snapId: string, jobId: string): void {
    this.#snapToJobMap.set(snapId, jobId);
    this.#jobToSnapMap.set(jobId, snapId);
  }

  #removeSnapAndJobMapping(jobId: string): void {
    const snapId = this.#jobToSnapMap.get(jobId);
    if (!snapId) {
      throw new Error(`job: "${jobId}" has no mapped snap.`);
    }

    this.#jobToSnapMap.delete(jobId);
    this.#snapToJobMap.delete(snapId);
    this.#removeSnapHooks(snapId);
  }

  /**
   * Handle RPC request.
   *
   * @param snapId - The ID of the recipient snap.
   * @param options - Bag of options to pass to the RPC handler.
   * @returns Promise that can handle the request.
   */
  public async handleRpcRequest(
    snapId: string,
    options: SnapRpcHookArgs,
  ): Promise<unknown> {
    const rpcRequestHandler = await this.getRpcRequestHandler(snapId);

    if (!rpcRequestHandler) {
      throw new Error(
        `Snap execution service returned no RPC handler for running snap "${snapId}".`,
      );
    }

    return rpcRequestHandler(options);
  }
}

/**
 * Sets up stream multiplexing for the given stream.
 *
 * @param connectionStream - The stream to mux.
 * @param streamName - The name of the stream, for identification in errors.
 * @returns The multiplexed stream.
 */
export function setupMultiplex(
  connectionStream: Duplex,
  streamName: string,
): ObjectMultiplex {
  const mux = new ObjectMultiplex();
  pump(
    connectionStream,
    // Typecast: stream type mismatch
    mux as unknown as Duplex,
    connectionStream,
    (error) => {
      if (error) {
        streamName
          ? logError(`"${streamName}" stream failure.`, error)
          : logError(error);
      }
    },
  );
  return mux;
}
