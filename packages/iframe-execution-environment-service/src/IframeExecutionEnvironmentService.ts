import { Duplex } from 'stream';
import { nanoid } from 'nanoid';
import pump from 'pump';
import ObjectMultiplex from '@metamask/object-multiplex';
import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { SNAP_STREAM_NAMES } from '@metamask/snap-workers';
import { createStreamMiddleware } from 'json-rpc-middleware-stream';
import { SnapData, ServiceMessenger } from '@metamask/snap-types';
import {
  JsonRpcEngine,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from 'json-rpc-engine';
import { ExecutionEnvironmentService } from '@metamask/snap-controllers';

export type SetupSnapProvider = (snapName: string, stream: Duplex) => void;

interface IframeExecutionEnvironmentServiceArgs {
  createWindowTimeout?: number;
  setupSnapProvider: SetupSnapProvider;
  iframeUrl: URL;
  messenger: ServiceMessenger;
  unresponsivePollingInterval?: number;
  unresponsiveTimeout?: number;
}

interface JobStreams {
  command: Duplex;
  rpc: Duplex | null;
  _connection: WindowPostMessageStream;
}

// The snap is the callee
export type SnapRpcHook = (
  origin: string,
  request: Record<string, unknown>,
) => Promise<unknown>;

interface EnvMetadata {
  id: string;
  streams: JobStreams;
  rpcEngine: JsonRpcEngine;
}

export class IframeExecutionEnvironmentService
  implements ExecutionEnvironmentService
{
  private _snapRpcHooks: Map<string, SnapRpcHook>;

  public _iframeWindow?: Window;

  public iframeUrl: URL;

  private jobs: Map<string, EnvMetadata>;

  private setupSnapProvider: SetupSnapProvider;

  private snapToJobMap: Map<string, string>;

  private jobToSnapMap: Map<string, string>;

  private _createWindowTimeout: number;

  private _messenger: ServiceMessenger;

  private _unresponsivePollingInterval: number;

  private _unresponsiveTimeout: number;

  private _timeoutForUnresponsiveMap: Map<string, number>;

  constructor({
    setupSnapProvider,
    iframeUrl,
    messenger,
    unresponsivePollingInterval = 5000,
    unresponsiveTimeout = 30000,
    createWindowTimeout = 60000,
  }: IframeExecutionEnvironmentServiceArgs) {
    this._createWindowTimeout = createWindowTimeout;
    this.iframeUrl = iframeUrl;
    this.setupSnapProvider = setupSnapProvider;
    this.jobs = new Map();
    this.snapToJobMap = new Map();
    this.jobToSnapMap = new Map();
    this._snapRpcHooks = new Map();
    this._messenger = messenger;
    this._unresponsivePollingInterval = unresponsivePollingInterval;
    this._unresponsiveTimeout = unresponsiveTimeout;
    this._timeoutForUnresponsiveMap = new Map();
  }

  private _setJob(jobId: string, jobWrapper: EnvMetadata): void {
    this.jobs.set(jobId, jobWrapper);
  }

  private _deleteJob(jobId: string): void {
    this.jobs.delete(jobId);
  }

  private async _command(
    jobId: string,
    message: JsonRpcRequest<unknown>,
  ): Promise<unknown> {
    if (typeof message !== 'object') {
      throw new Error('Must send object.');
    }

    const jobWrapper = this.jobs.get(jobId);
    if (!jobWrapper) {
      throw new Error(`Job with id "${jobId}" not found.`);
    }

    console.log('Parent: Sending Command', message);
    const response: PendingJsonRpcResponse<unknown> =
      await jobWrapper.rpcEngine.handle(message);
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.result;
  }

  public async terminateAllSnaps() {
    for (const jobId of this.jobs.keys()) {
      this.terminate(jobId);
    }
    this._snapRpcHooks.clear();
  }

  public async terminateSnap(snapName: string) {
    const jobId = this.snapToJobMap.get(snapName);
    if (!jobId) {
      throw new Error(`Job not found for snap with name "${snapName}".`);
    }
    this.terminate(jobId);
  }

  public terminate(jobId: string): void {
    const jobWrapper = this.jobs.get(jobId);

    if (!jobWrapper) {
      throw new Error(`Job with id "${jobId}" not found.`);
    }

    const snapName = this.jobToSnapMap.get(jobId);

    if (!snapName) {
      throw new Error(`Failed to find a snap for job with id "${jobId}"`);
    }

    Object.values(jobWrapper.streams).forEach((stream) => {
      try {
        !stream.destroyed && stream.destroy();
        stream.removeAllListeners();
      } catch (err) {
        console.log('Error while destroying stream', err);
      }
    });
    document.getElementById(jobWrapper.id)?.remove();
    clearTimeout(this._timeoutForUnresponsiveMap.get(snapName));
    this._timeoutForUnresponsiveMap.delete(snapName);
    this._removeSnapAndJobMapping(jobId);
    this._deleteJob(jobId);
    console.log(`job: "${jobId}" terminated`);
  }

  /**
   * Gets the RPC message handler for the given snap.
   *
   * @param snapName - The name of the snap whose message handler to get.
   */
  public async getRpcMessageHandler(snapName: string) {
    return this._snapRpcHooks.get(snapName);
  }

  private _removeSnapHooks(snapName: string) {
    this._snapRpcHooks.delete(snapName);
  }

  private _createSnapHooks(snapName: string, jobId: string) {
    const rpcHook = async (
      origin: string,
      request: Record<string, unknown>,
    ) => {
      return await this._command(jobId, {
        id: nanoid(),
        jsonrpc: '2.0',
        method: 'snapRpc',
        params: {
          origin,
          request,
          target: snapName,
        },
      });
    };

    this._snapRpcHooks.set(snapName, rpcHook);
  }

  public async executeSnap(snapData: SnapData): Promise<unknown> {
    if (this.snapToJobMap.has(snapData.snapName)) {
      throw new Error(`Snap "${snapData.snapName}" is already being executed.`);
    }

    const job = await this._init();
    this._mapSnapAndJob(snapData.snapName, job.id);

    let result;
    try {
      result = await this._command(job.id, {
        jsonrpc: '2.0',
        method: 'executeSnap',
        params: snapData,
        id: nanoid(),
      });
    } catch (error) {
      this.terminate(job.id);
      throw error;
    }

    this.setupSnapProvider(
      snapData.snapName,
      job.streams.rpc as unknown as Duplex,
    );
    // set up poll/ping for status to see if its up, if its not then emit event that it cant be reached
    this._pollForJobStatus(snapData.snapName);
    this._createSnapHooks(snapData.snapName, job.id);
    return result;
  }

  _pollForJobStatus(snapName: string) {
    const jobId = this.snapToJobMap.get(snapName);
    if (!jobId) {
      throw new Error('no job id found for snap');
    }

    const timeout = setTimeout(async () => {
      this._getJobStatus(jobId)
        .then(() => {
          this._pollForJobStatus(snapName);
        })
        .catch(() => {
          this._messenger.publish('ServiceMessenger:unresponsive', snapName);
        });
    }, this._unresponsivePollingInterval) as unknown as number;
    this._timeoutForUnresponsiveMap.set(snapName, timeout);
  }

  async _getJobStatus(jobId: string) {
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

  private _mapSnapAndJob(snapName: string, jobId: string): void {
    this.snapToJobMap.set(snapName, jobId);
    this.jobToSnapMap.set(jobId, snapName);
  }

  private _removeSnapAndJobMapping(jobId: string): void {
    const snapName = this.jobToSnapMap.get(jobId);
    if (!snapName) {
      throw new Error(`job: "${jobId}" has no mapped snap.`);
    }

    this.jobToSnapMap.delete(jobId);
    this.snapToJobMap.delete(snapName);
    this._removeSnapHooks(snapName);
  }

  private async _init(): Promise<EnvMetadata> {
    const jobId = nanoid();
    const streams = await this._initStreams(jobId);
    const rpcEngine = new JsonRpcEngine();

    const jsonRpcConnection = createStreamMiddleware();

    pump(jsonRpcConnection.stream, streams.command, jsonRpcConnection.stream);

    rpcEngine.push(jsonRpcConnection.middleware);

    const envMetadata = {
      id: jobId,
      streams,
      rpcEngine,
    };
    this._setJob(jobId, envMetadata);

    await this._command(jobId, {
      jsonrpc: '2.0',
      method: 'ping',
      id: nanoid(),
    });

    return envMetadata;
  }

  private async _initStreams(jobId: string): Promise<any> {
    this._iframeWindow = await this._createWindow(
      this.iframeUrl.toString(),
      jobId,
      this._createWindowTimeout,
    );
    const envStream = new WindowPostMessageStream({
      name: 'parent',
      target: 'child',
      targetWindow: this._iframeWindow,
    });
    // Typecast justification: stream type mismatch
    const mux = setupMultiplex(
      envStream as unknown as Duplex,
      `Job: "${jobId}"`,
    );

    const commandStream = mux.createStream(SNAP_STREAM_NAMES.COMMAND);
    // Handle out-of-band errors, i.e. errors thrown from the snap outside of the req/res cycle.
    const errorHandler = (data: any) => {
      if (
        data.error &&
        (data.id === null || data.id === undefined) // only out of band errors (i.e. no id)
      ) {
        const snapName = this.jobToSnapMap.get(jobId);
        if (snapName) {
          this._messenger.publish(
            'ServiceMessenger:unhandledError',
            snapName,
            data.error,
          );
        }
        commandStream.removeListener('data', errorHandler);
      }
    };
    commandStream.on('data', errorHandler);
    const rpcStream = mux.createStream(SNAP_STREAM_NAMES.JSON_RPC);

    // Typecast: stream type mismatch
    return {
      command: commandStream as unknown as Duplex,
      rpc: rpcStream,
      _connection: envStream,
    };
  }

  private _createWindow(
    uri: string,
    jobId: string,
    timeout: number,
  ): Promise<Window> {
    const iframe = document.createElement('iframe');
    return new Promise((resolve, reject) => {
      const errorTimeout = setTimeout(() => {
        iframe.remove();
        reject(new Error(`Timed out creating iframe window: "${uri}"`));
      }, timeout);
      iframe.addEventListener('load', () => {
        if (iframe.contentWindow) {
          clearTimeout(errorTimeout);
          resolve(iframe.contentWindow);
        }
      });
      document.body.appendChild(iframe);
      iframe.setAttribute('src', uri);
      iframe.setAttribute('id', jobId);
    });
  }
}

/**
 * Sets up stream multiplexing for the given stream.
 *
 * @param {any} connectionStream - the stream to mux
 * @param {string} streamName - the name of the stream, for identification in errors
 * @return {stream.Stream} the multiplexed stream
 */
function setupMultiplex(
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
