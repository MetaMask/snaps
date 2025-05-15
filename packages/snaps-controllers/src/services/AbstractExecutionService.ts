import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import { createStreamMiddleware } from '@metamask/json-rpc-middleware-stream';
import ObjectMultiplex from '@metamask/object-multiplex';
import type { BasePostMessageStream } from '@metamask/post-message-stream';
import { JsonRpcError } from '@metamask/rpc-errors';
import type { SnapRpcHookArgs } from '@metamask/snaps-utils';
import { SNAP_STREAM_NAMES, logError } from '@metamask/snaps-utils';
import type {
  Json,
  JsonRpcNotification,
  JsonRpcRequest,
} from '@metamask/utils';
import {
  Duration,
  assertIsJsonRpcRequest,
  hasProperty,
  inMilliseconds,
  isJsonRpcFailure,
  isObject,
} from '@metamask/utils';
import { nanoid } from 'nanoid';
import { pipeline } from 'readable-stream';
import type { Duplex } from 'readable-stream';

import type {
  ExecutionService,
  ExecutionServiceMessenger,
  SnapErrorJson,
  SnapExecutionData,
} from './ExecutionService';
import { log } from '../logging';
import { Timer } from '../snaps/Timer';
import { hasTimedOut, withTimeout } from '../utils';

const controllerName = 'ExecutionService';

export type SetupSnapProvider = (snapId: string, stream: Duplex) => void;

export type ExecutionServiceArgs = {
  setupSnapProvider: SetupSnapProvider;
  messenger: ExecutionServiceMessenger;
  initTimeout?: number;
  pingTimeout?: number;
  terminationTimeout?: number;
  usePing?: boolean;
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

export type TerminateJobArgs<WorkerType> = Partial<Job<WorkerType>> &
  Pick<Job<WorkerType>, 'id'>;

export abstract class AbstractExecutionService<WorkerType>
  implements ExecutionService
{
  name: typeof controllerName = controllerName;

  state = null;

  // Cannot be hash private yet because of tests.
  protected jobs: Map<string, Job<WorkerType>>;

  readonly #setupSnapProvider: SetupSnapProvider;

  readonly #messenger: ExecutionServiceMessenger;

  readonly #initTimeout: number;

  readonly #pingTimeout: number;

  readonly #terminationTimeout: number;

  readonly #usePing: boolean;

  constructor({
    setupSnapProvider,
    messenger,
    initTimeout = inMilliseconds(60, Duration.Second),
    pingTimeout = inMilliseconds(2, Duration.Second),
    terminationTimeout = inMilliseconds(1, Duration.Second),
    usePing = true,
  }: ExecutionServiceArgs) {
    this.jobs = new Map();
    this.#setupSnapProvider = setupSnapProvider;
    this.#messenger = messenger;
    this.#initTimeout = initTimeout;
    this.#pingTimeout = pingTimeout;
    this.#terminationTimeout = terminationTimeout;
    this.#usePing = usePing;

    this.#registerMessageHandlers();
  }

  /**
   * Constructor helper for registering the controller's messaging system
   * actions.
   */
  #registerMessageHandlers(): void {
    this.#messenger.registerActionHandler(
      `${controllerName}:handleRpcRequest`,
      async (snapId: string, options: SnapRpcHookArgs) =>
        this.handleRpcRequest(snapId, options),
    );

    this.#messenger.registerActionHandler(
      `${controllerName}:executeSnap`,
      async (data: SnapExecutionData) => this.executeSnap(data),
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
  protected abstract terminateJob(job: TerminateJobArgs<WorkerType>): void;

  /**
   * Terminates the Snap with the specified ID and deletes all its associated
   * data. Any subsequent messages targeting the Snap will fail with an error.
   * Throws an error if the specified Snap does not exist, or if termination
   * fails unexpectedly.
   *
   * @param snapId - The id of the Snap to be terminated.
   */
  public async terminate(snapId: string): Promise<void> {
    const jobWrapper = this.jobs.get(snapId);
    if (!jobWrapper) {
      throw new Error(`"${snapId}" is not currently running.`);
    }

    try {
      // Ping worker and tell it to run teardown, continue with termination if it takes too long
      const result = await withTimeout(
        this.#command(snapId, {
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
        logError(`Snap "${snapId}" failed to terminate gracefully.`, result);
      }
    } catch {
      // Ignore
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

    this.jobs.delete(snapId);
    log(`Snap "${snapId}" terminated.`);
  }

  /**
   * Initiates a job for a Snap.
   *
   * @param snapId - The ID of the Snap to initiate a job for.
   * @param timer - The timer to use for timeouts.
   * @returns Information regarding the created job.
   * @throws If the execution service returns an error or execution times out.
   */
  async #initJob(snapId: string, timer: Timer): Promise<Job<WorkerType>> {
    const { streams, worker } = await this.#initStreams(snapId, timer);
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
      },
    );

    rpcEngine.push(jsonRpcConnection.middleware);

    const envMetadata = {
      id: snapId,
      streams,
      rpcEngine,
      worker,
    };
    this.jobs.set(snapId, envMetadata);

    return envMetadata;
  }

  /**
   * Sets up the streams for an initiated job.
   *
   * @param snapId - The Snap ID.
   * @param timer - The timer to use for timeouts.
   * @returns The streams to communicate with the worker and the worker itself.
   * @throws If the execution service returns an error or execution times out.
   */
  async #initStreams(
    snapId: string,
    timer: Timer,
  ): Promise<{ streams: JobStreams; worker: WorkerType }> {
    const result = await withTimeout(this.initEnvStream(snapId), timer);

    if (result === hasTimedOut) {
      // For certain environments, such as the iframe we may have already created the worker and wish to terminate it.
      this.terminateJob({ id: snapId });
      throw new Error('The Snaps execution environment failed to start.');
    }

    const { worker, stream: envStream } = result;
    const mux = setupMultiplex(envStream, `Snap: "${snapId}"`);
    const commandStream = mux.createStream(SNAP_STREAM_NAMES.COMMAND);

    // Handle out-of-band errors, i.e. errors thrown from the Snap outside of the req/res cycle.
    // Also keep track of outbound request/responses
    const notificationHandler = (
      message:
        | JsonRpcRequest
        | JsonRpcNotification<Json[] | Record<string, Json>>,
    ) => {
      if (hasProperty(message, 'id')) {
        return;
      }

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
        command: commandStream,
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
  protected abstract initEnvStream(snapId: string): Promise<{
    worker: WorkerType;
    stream: BasePostMessageStream;
  }>;

  /**
   * Terminates the Snap with the specified ID. May throw an error if
   * termination unexpectedly fails, but will not fail if no job for the Snap
   * with the specified ID is found.
   *
   * @param snapId - The ID of the Snap to terminate.
   */
  async terminateSnap(snapId: string) {
    await this.terminate(snapId);
  }

  async terminateAllSnaps() {
    await Promise.all(
      [...this.jobs.keys()].map(async (snapId) => this.terminate(snapId)),
    );
  }

  /**
   * Initializes and executes a Snap, setting up the communication channels to the Snap etc.
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
    endowments,
  }: SnapExecutionData): Promise<string> {
    if (this.jobs.has(snapId)) {
      throw new Error(`Snap "${snapId}" is already being executed.`);
    }

    const timer = new Timer(this.#initTimeout);

    // This may resolve even if the environment has failed to start up fully
    const job = await this.#initJob(snapId, timer);

    // Certain environments use ping as part of their initialization and thus can skip it here
    if (this.#usePing) {
      // Ping the worker to ensure that it started up
      const pingResult = await withTimeout(
        this.#command(job.id, {
          jsonrpc: '2.0',
          method: 'ping',
          id: nanoid(),
        }),
        this.#pingTimeout,
      );

      if (pingResult === hasTimedOut) {
        throw new Error('The Snaps execution environment failed to start.');
      }
    }

    const rpcStream = job.streams.rpc;

    this.#setupSnapProvider(snapId, rpcStream);

    const remainingTime = timer.remaining;

    const request = {
      jsonrpc: '2.0',
      method: 'executeSnap',
      params: { snapId, sourceCode, endowments },
      id: nanoid(),
    };

    assertIsJsonRpcRequest(request);

    const result = await withTimeout(
      this.#command(job.id, request),
      remainingTime,
    );

    if (result === hasTimedOut) {
      throw new Error(`${snapId} failed to start.`);
    }

    return result as string;
  }

  async #command(
    snapId: string,
    message: JsonRpcRequest,
  ): Promise<Json | undefined> {
    const job = this.jobs.get(snapId);
    if (!job) {
      throw new Error(`"${snapId}" is not currently running.`);
    }

    log('Parent: Sending Command', message);
    const response = await job.rpcEngine.handle(message);

    if (isJsonRpcFailure(response)) {
      throw new JsonRpcError(
        response.error.code,
        response.error.message,
        response.error.data,
      );
    }

    return response.result;
  }

  /**
   * Handle RPC request.
   *
   * @param snapId - The ID of the recipient Snap.
   * @param options - Bag of options to pass to the RPC handler.
   * @returns Promise that can handle the request.
   */
  public async handleRpcRequest(
    snapId: string,
    options: SnapRpcHookArgs,
  ): Promise<unknown> {
    const { handler, request, origin } = options;

    return await this.#command(snapId, {
      id: nanoid(),
      jsonrpc: '2.0',
      method: 'snapRpc',
      params: {
        origin,
        handler,
        request: request as JsonRpcRequest,
        target: snapId,
      },
    });
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
  pipeline(connectionStream, mux, connectionStream, (error) => {
    if (error) {
      streamName
        ? logError(`"${streamName}" stream failure.`, error)
        : logError(error);
    }
  });
  return mux;
}
