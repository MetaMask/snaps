import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import { createStreamMiddleware } from '@metamask/json-rpc-middleware-stream';
import ObjectMultiplex from '@metamask/object-multiplex';
import type { BasePostMessageStream } from '@metamask/post-message-stream';
import { JsonRpcError } from '@metamask/rpc-errors';
import type { SnapRpcHookArgs } from '@metamask/snaps-utils';
import { SNAP_STREAM_NAMES, logError, logWarning } from '@metamask/snaps-utils';
import type {
  Json,
  JsonRpcError as JsonRpcErrorType,
  JsonRpcNotification,
  JsonRpcRequest,
} from '@metamask/utils';
import {
  Duration,
  assertIsJsonRpcRequest,
  hasProperty,
  inMilliseconds,
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
  connection: BasePostMessageStream;
  mux: ObjectMultiplex;
};

export type Job<WorkerType> = {
  id: string;
  streams: JobStreams;
  rpcEngine: JsonRpcEngine;
  worker: WorkerType;
};

export type TerminateJobArgs<WorkerType> = Partial<Job<WorkerType>> &
  Pick<Job<WorkerType>, 'id'>;

/** 
  Statuses used for diagnostic purposes
  - created: The initial state, no initialization has started 
  - initializing: Snap execution environment is initializing
  - initialized: Snap execution environment has initialized
  - executing: Snap source code is being executed
  - running: Snap executed and ready for RPC requests
 */
type ExecutionStatus =
  | 'created'
  | 'initializing'
  | 'initialized'
  | 'executing'
  | 'running';

export abstract class AbstractExecutionService<WorkerType>
  implements ExecutionService
{
  name: typeof controllerName = controllerName;

  state = null;

  readonly #jobs: Map<string, Job<WorkerType>>;

  readonly #status: Map<string, ExecutionStatus>;

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
    pingTimeout = inMilliseconds(10, Duration.Second),
    terminationTimeout = inMilliseconds(1, Duration.Second),
    usePing = true,
  }: ExecutionServiceArgs) {
    this.#jobs = new Map();
    this.#status = new Map();
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
  protected abstract terminateJob(
    job: TerminateJobArgs<WorkerType>,
  ): Promise<void>;

  /**
   * Terminates the Snap with the specified ID and deletes all its associated
   * data. Any subsequent messages targeting the Snap will fail with an error.
   * Throws an error if termination fails unexpectedly.
   *
   * @param snapId - The id of the Snap to be terminated.
   */
  public async terminateSnap(snapId: string): Promise<void> {
    const job = this.#jobs.get(snapId);
    if (!job) {
      return;
    }

    try {
      // Ping worker and tell it to run teardown, continue with termination if it takes too long
      const result = await withTimeout(
        this.#command(snapId, {
          jsonrpc: '2.0',
          method: 'terminate',
          id: nanoid(),
        }),
        this.#terminationTimeout,
      );

      if (result === hasTimedOut || result !== 'OK') {
        logWarning(`Snap "${snapId}" failed to terminate gracefully.`);
      }
    } catch {
      // Ignore
    }

    Object.values(job.streams).forEach((stream) => {
      try {
        if (!stream.destroyed) {
          stream.destroy();
        }
      } catch (error) {
        logError('Error while destroying stream', error);
      }
    });

    await this.terminateJob(job);

    this.#jobs.delete(snapId);
    this.#status.delete(snapId);
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
        if (error && !error.message?.match('Premature close')) {
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
    this.#jobs.set(snapId, envMetadata);

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
      await this.terminateJob({ id: snapId });

      const status = this.#status.get(snapId);
      if (status === 'created') {
        // Currently this error can only be thrown by OffscreenExecutionService.
        throw new Error(
          `The executor for "${snapId}" couldn't start initialization. The offscreen document may not exist.`,
        );
      }
      throw new Error(
        `The executor for "${snapId}" failed to initialize. The iframe/webview/worker failed to load.`,
      );
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
        this.#messenger.publish(
          'ExecutionService:unhandledError',
          snapId,
          (message.params as { error: SnapErrorJson }).error,
        );
        commandStream.removeListener('data', notificationHandler);
      } else {
        logError(
          new Error(
            `Received unexpected command stream notification "${message.method}".`,
          ),
        );
      }
    };

    commandStream.on('data', notificationHandler);

    const rpcStream = mux
      .createStream(SNAP_STREAM_NAMES.JSON_RPC)
      .setMaxListeners(20);

    rpcStream.on('data', (chunk) => {
      if (chunk?.data && hasProperty(chunk?.data, 'id')) {
        this.#messenger.publish('ExecutionService:outboundRequest', snapId);
      }
    });

    const originalWrite = rpcStream.write.bind(rpcStream);

    // @ts-expect-error Hack to inspect the messages being written to the stream.
    rpcStream.write = (chunk, encoding, callback) => {
      // Ignore chain switching notifications as it doesn't matter for the SnapProvider.
      if (chunk?.data?.method === 'metamask_chainChanged') {
        return true;
      }

      if (chunk?.data && hasProperty(chunk?.data, 'id')) {
        this.#messenger.publish('ExecutionService:outboundResponse', snapId);
      }

      return originalWrite(chunk, encoding, callback);
    };

    return {
      streams: {
        command: commandStream,
        rpc: rpcStream,
        connection: envStream,
        mux,
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
   * Set the execution status of the Snap.
   *
   * @param snapId - The Snap ID.
   * @param status - The current execution status.
   */
  protected setSnapStatus(snapId: string, status: ExecutionStatus) {
    this.#status.set(snapId, status);
  }

  async terminateAllSnaps() {
    await Promise.all(
      [...this.#jobs.keys()].map(async (snapId) => this.terminateSnap(snapId)),
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
    if (this.#jobs.has(snapId)) {
      throw new Error(`"${snapId}" is already running.`);
    }

    this.setSnapStatus(snapId, 'created');

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
        throw new Error(
          `The executor for "${snapId}" was unreachable. The executor did not respond in time.`,
        );
      }
    }

    const rpcStream = job.streams.rpc;

    this.#setupSnapProvider(snapId, rpcStream);

    // Use the remaining time as the timer, but ensure that the
    // Snap gets at least half the init timeout.
    const remainingTime = Math.max(timer.remaining, this.#initTimeout / 2);

    this.setSnapStatus(snapId, 'initialized');

    const request = {
      jsonrpc: '2.0',
      method: 'executeSnap',
      params: { snapId, sourceCode, endowments },
      id: nanoid(),
    };

    assertIsJsonRpcRequest(request);

    this.setSnapStatus(snapId, 'executing');

    const result = await withTimeout(
      this.#command(job.id, request),
      remainingTime,
    );

    if (result === hasTimedOut) {
      throw new Error(`${snapId} failed to start.`);
    }

    if (result === 'OK') {
      this.setSnapStatus(snapId, 'running');
    }

    return result as string;
  }

  async #command(
    snapId: string,
    message: JsonRpcRequest,
  ): Promise<Json | undefined> {
    const job = this.#jobs.get(snapId);
    if (!job) {
      throw new Error(`"${snapId}" is not currently running.`);
    }

    log('Parent: Sending Command', message);
    const response = await job.rpcEngine.handle(message);

    // We don't need full validation of the response here because we control it.
    if (hasProperty(response, 'error')) {
      const error = response.error as JsonRpcErrorType;
      throw new JsonRpcError(error.code, error.message, error.data);
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
        snapId,
        origin,
        handler,
        request: request as JsonRpcRequest,
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
    if (error && !error.message?.match('Premature close')) {
      logError(`"${streamName}" stream failure.`, error);
    }
  });
  return mux;
}
