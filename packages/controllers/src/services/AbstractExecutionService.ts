import { Duplex } from 'stream';
import ObjectMultiplex from '@metamask/object-multiplex';
import {
  ExecutionServiceMessenger,
  SnapExecutionData,
} from '@metamask/snap-types';
import {
  JsonRpcEngine,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from 'json-rpc-engine';
import { nanoid } from 'nanoid';
import pump from 'pump';
import { ExecutionService } from '.';

export type SetupSnapProvider = (snapId: string, stream: Duplex) => void;

type ExecutionServiceArgs = {
  setupSnapProvider: SetupSnapProvider;
  messenger: ExecutionServiceMessenger;
  unresponsivePollingInterval?: number;
  unresponsiveTimeout?: number;
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
  implements ExecutionService {
  protected _snapRpcHooks: Map<string, SnapRpcHook>;

  protected jobs: Map<string, JobType>;

  protected setupSnapProvider: SetupSnapProvider;

  protected snapToJobMap: Map<string, string>;

  protected jobToSnapMap: Map<string, string>;

  protected _messenger: ExecutionServiceMessenger;

  protected _unresponsivePollingInterval: number;

  protected _unresponsiveTimeout: number;

  protected _timeoutForUnresponsiveMap: Map<string, number>;

  constructor({
    setupSnapProvider,
    messenger,
    unresponsivePollingInterval = 5000,
    unresponsiveTimeout = 30000,
  }: ExecutionServiceArgs) {
    this._snapRpcHooks = new Map();
    this.jobs = new Map();
    this.setupSnapProvider = setupSnapProvider;
    this.snapToJobMap = new Map();
    this.jobToSnapMap = new Map();
    this._messenger = messenger;
    this._unresponsivePollingInterval = unresponsivePollingInterval;
    this._unresponsiveTimeout = unresponsiveTimeout;
    this._timeoutForUnresponsiveMap = new Map();
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
   *
   * @param jobId - The id of the job to be terminated.
   */
  public terminate(jobId: string): void {
    const jobWrapper = this.jobs.get(jobId);
    if (!jobWrapper) {
      throw new Error(`Job with id "${jobId}" not found.`);
    }

    Object.values(jobWrapper.streams).forEach((stream) => {
      try {
        !stream.destroyed && stream.destroy();
        stream.removeAllListeners();
      } catch (err) {
        console.log('Error while destroying stream', err);
      }
    });

    this._terminate(jobWrapper);

    const snapId = this.jobToSnapMap.get(jobId);
    if (!snapId) {
      throw new Error(`Failed to find a snap for job with id "${jobId}"`);
    }

    clearTimeout(this._timeoutForUnresponsiveMap.get(snapId));
    this._timeoutForUnresponsiveMap.delete(snapId);
    this._removeSnapAndJobMapping(jobId);
    this.jobs.delete(jobId);
    console.log(`job: "${jobId}" terminated`);
  }

  protected abstract _initJob(): Promise<JobType>;

  async terminateSnap(snapId: string) {
    const jobId = this.snapToJobMap.get(snapId);
    if (jobId) {
      this.terminate(jobId);
    }
  }

  async terminateAllSnaps() {
    for (const workerId of this.jobs.keys()) {
      this.terminate(workerId);
    }
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

  async executeSnap(snapData: SnapExecutionData): Promise<unknown> {
    if (this.snapToJobMap.has(snapData.snapId)) {
      throw new Error(`Snap "${snapData.snapId}" is already being executed.`);
    }

    const job = await this._initJob();
    this._mapSnapAndJob(snapData.snapId, job.id);
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
    // set up poll/ping for status to see if its up, if its not then emit event that it cant be reached
    this._pollForJobStatus(snapData.snapId);
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

  protected _pollForJobStatus(snapId: string) {
    const jobId = this.snapToJobMap.get(snapId);
    if (!jobId) {
      throw new Error('no job id found for snap');
    }

    const timeout = setTimeout(async () => {
      try {
        await this._getJobStatus(jobId);
        this._pollForJobStatus(snapId);
      } catch {
        // The snap may have been terminated by the time we get here.
        if (this.snapToJobMap.has(snapId)) {
          this._messenger.publish('ExecutionService:unresponsive', snapId);
        }
      }
    }, this._unresponsivePollingInterval) as unknown as number;
    this._timeoutForUnresponsiveMap.set(snapId, timeout);
  }

  protected async _getJobStatus(jobId: string) {
    let resolve: any;
    let reject: any;

    const timeoutPromise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    const timeout = setTimeout(() => {
      reject(new Error('ping request timed out'));
    }, this._unresponsiveTimeout);

    return Promise.race([
      this._command(jobId, {
        jsonrpc: '2.0',
        method: 'ping',
        params: [],
        id: nanoid(),
      }).then(() => {
        clearTimeout(timeout);
        resolve();
      }),
      timeoutPromise,
    ]);
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
