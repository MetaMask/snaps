import { Duplex } from 'stream';
import ObjectMultiplex from '@metamask/object-multiplex';
import {
  ExecutionServiceMessenger,
  SnapExecutionData,
} from '@metamask/snap-types';
import {
  JsonRpcEngine,
  PendingJsonRpcResponse,
  // TODO: Replace with @metamask/utils version after bumping json-rpc-engine
  JsonRpcRequest,
} from 'json-rpc-engine';
import { nanoid } from 'nanoid';
import pump from 'pump';
import { ExecutionService } from '.';

export type SetupSnapProvider = (snapId: string, stream: Duplex) => void;

type ExecutionServiceArgs = {
  setupSnapProvider: SetupSnapProvider;
  messenger: ExecutionServiceMessenger;
  terminationTimeout?: number;
};

// The snap is the callee
export type SnapRpcHook = (
  origin: string,
  request: Record<string, unknown>,
) => Promise<unknown>;

interface JobStreams {
  rpc: Duplex | null;
}

type Job = {
  id: string;
  streams: JobStreams;
  rpcEngine: JsonRpcEngine;
};

export abstract class AbstractExecutionService<JobType extends Job>
  implements ExecutionService
{
  protected _snapRpcHooks: Map<string, SnapRpcHook>;

  protected jobs: Map<string, JobType>;

  protected setupSnapProvider: SetupSnapProvider;

  protected snapToJobMap: Map<string, string>;

  protected jobToSnapMap: Map<string, string>;

  protected _messenger: ExecutionServiceMessenger;

  protected _terminationTimeout: number;

  constructor({
    setupSnapProvider,
    messenger,
    terminationTimeout = 1000,
  }: ExecutionServiceArgs) {
    this._snapRpcHooks = new Map();
    this.jobs = new Map();
    this.setupSnapProvider = setupSnapProvider;
    this.snapToJobMap = new Map();
    this.jobToSnapMap = new Map();
    this._messenger = messenger;
    this._terminationTimeout = terminationTimeout;
  }

  /**
   * Performs additional necessary work during job termination. **MUST** be
   * implemented by concrete implementations. See
   * {@link AbstractExecutionService.terminate} for details.
   *
   * @param job - The object corresponding to the job to be terminated.
   */
  protected abstract _terminate(job: JobType): void;

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

    let terminationTimeout: number | undefined;

    const terminationTimeoutPromise = new Promise<void>((resolve) => {
      terminationTimeout = setTimeout(() => {
        // No need to reject here, we just resolve and move on if the terminate request doesn't respond quickly
        resolve();
      }, this._terminationTimeout) as unknown as number;
    });

    // Ping worker and tell it to run teardown, continue with termination if it takes too long
    try {
      await Promise.race([
        this._command(jobId, {
          jsonrpc: '2.0',
          method: 'terminate',
          params: [],
          id: nanoid(),
        }),
        terminationTimeoutPromise,
      ]);
    } catch (error) {
      console.error(`Job "${jobId}" failed to terminate gracefully.`, error);
    }

    clearTimeout(terminationTimeout);

    Object.values(jobWrapper.streams).forEach((stream) => {
      try {
        !stream.destroyed && stream.destroy();
        stream.removeAllListeners();
      } catch (err) {
        console.error('Error while destroying stream', err);
      }
    });

    this._terminate(jobWrapper);

    this._removeSnapAndJobMapping(jobId);
    this.jobs.delete(jobId);
    console.log(`job: "${jobId}" terminated`);
  }

  /**
   * Abstract function implemented by implementing class that spins up a new worker for a job.
   *
   * Depending on the execution environment, this may run forever if the Snap fails to start up properly, therefore any call to this function should be wrapped in a timeout.
   */
  protected abstract _initJob(): Promise<JobType>;

  /**
   * Terminates the Snap with the specified ID. May throw an error if
   * termination unexpectedly fails, but will not fail if no job for the snap
   * with the specified ID is found.
   *
   * @param snapId - The ID of the snap to terminate.
   */
  async terminateSnap(snapId: string) {
    const jobId = this.snapToJobMap.get(snapId);
    if (jobId) {
      await this.terminate(jobId);
    }
  }

  async terminateAllSnaps() {
    await Promise.all(
      [...this.jobs.keys()].map((workerId) => this.terminate(workerId)),
    );
    this._snapRpcHooks.clear();
  }

  /**
   * Gets the RPC message handler for the given snap.
   *
   * @param snapId - The id of the Snap whose message handler to get.
   */
  async getRpcMessageHandler(snapId: string) {
    return this._snapRpcHooks.get(snapId);
  }

  /**
   * Initializes and executes a snap, setting up the communication channels to the snap etc.
   *
   * Depending on the execution environment, this may run forever if the Snap fails to start up properly, therefore any call to this function should be wrapped in a timeout.
   *
   * @param snapData - Data needed for Snap execution.
   */
  async executeSnap(snapData: SnapExecutionData): Promise<unknown> {
    if (this.snapToJobMap.has(snapData.snapId)) {
      throw new Error(`Snap "${snapData.snapId}" is already being executed.`);
    }

    const job = await this._initJob();
    this._mapSnapAndJob(snapData.snapId, job.id);

    // Ping the worker to ensure that it started up
    await this._command(job.id, {
      jsonrpc: '2.0',
      method: 'ping',
      id: nanoid(),
    });

    this.setupSnapProvider(
      snapData.snapId,
      job.streams.rpc as unknown as Duplex,
    );

    const result = await this._command(job.id, {
      jsonrpc: '2.0',
      method: 'executeSnap',
      params: snapData,
      id: nanoid(),
    });
    this._createSnapHooks(snapData.snapId, job.id);
    return result;
  }

  protected async _command(
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

    console.log('Parent: Sending Command', message);
    const response: PendingJsonRpcResponse<unknown> =
      await job.rpcEngine.handle(message);
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.result;
  }

  protected _removeSnapHooks(snapId: string) {
    this._snapRpcHooks.delete(snapId);
  }

  protected _createSnapHooks(snapId: string, workerId: string) {
    const rpcHook = async (
      origin: string,
      request: Record<string, unknown>,
    ) => {
      return await this._command(workerId, {
        id: nanoid(),
        jsonrpc: '2.0',
        method: 'snapRpc',
        params: {
          origin,
          request,
          target: snapId,
        },
      });
    };

    this._snapRpcHooks.set(snapId, rpcHook);
  }

  /**
   * @returns The ID of the snap's job.
   */
  protected _getJobForSnap(snapId: string): string | undefined {
    return this.snapToJobMap.get(snapId);
  }

  /**
   * @returns The ID jobs's snap.
   */
  _getSnapForJob(jobId: string): string | undefined {
    return this.jobToSnapMap.get(jobId);
  }

  protected _mapSnapAndJob(snapId: string, jobId: string): void {
    this.snapToJobMap.set(snapId, jobId);
    this.jobToSnapMap.set(jobId, snapId);
  }

  protected _removeSnapAndJobMapping(jobId: string): void {
    const snapId = this.jobToSnapMap.get(jobId);
    if (!snapId) {
      throw new Error(`job: "${jobId}" has no mapped snap.`);
    }

    this.jobToSnapMap.delete(jobId);
    this.snapToJobMap.delete(snapId);
    this._removeSnapHooks(snapId);
  }
}

/**
 * Sets up stream multiplexing for the given stream.
 *
 * @param connectionStream - the stream to mux
 * @param streamName - the name of the stream, for identification in errors
 * @return {stream.Stream} the multiplexed stream
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
    (err) => {
      if (err) {
        streamName
          ? console.error(`"${streamName}" stream failure.`, err)
          : console.error(err);
      }
    },
  );
  return mux;
}
