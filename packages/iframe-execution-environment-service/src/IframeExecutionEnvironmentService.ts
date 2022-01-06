import { WindowPostMessageStream } from '@metamask/post-message-stream';
import {
  AbstractExecutionService,
  setupMultiplex,
  SetupSnapProvider,
} from '@metamask/snap-controllers';
import { ServiceMessenger } from '@metamask/snap-types';
import { SNAP_STREAM_NAMES } from '@metamask/snap-workers';
import { JsonRpcEngine } from 'json-rpc-engine';
import { createStreamMiddleware } from 'json-rpc-middleware-stream';
import { nanoid } from 'nanoid';
import pump from 'pump';
import { Duplex } from 'stream';

type IframeExecutionEnvironmentServiceArgs = {
  createWindowTimeout?: number;
  setupSnapProvider: SetupSnapProvider;
  iframeUrl: URL;
  messenger: ServiceMessenger;
  unresponsivePollingInterval?: number;
  unresponsiveTimeout?: number;
};

type JobStreams = {
  command: Duplex;
  rpc: Duplex | null;
  _connection: WindowPostMessageStream;
};

type EnvMetadata = {
  id: string;
  streams: JobStreams;
  rpcEngine: JsonRpcEngine;
};

export class IframeExecutionEnvironmentService extends AbstractExecutionService<EnvMetadata> {
  public _iframeWindow?: Window;

  public iframeUrl: URL;

  private _createWindowTimeout: number;

  constructor({
    setupSnapProvider,
    iframeUrl,
    messenger,
    unresponsivePollingInterval = 5000,
    unresponsiveTimeout = 30000,
    createWindowTimeout = 60000,
  }: IframeExecutionEnvironmentServiceArgs) {
    super({
      setupSnapProvider,
      messenger,
      unresponsivePollingInterval,
      unresponsiveTimeout,
    });
    this._createWindowTimeout = createWindowTimeout;
    this.iframeUrl = iframeUrl;
  }

  private _setJob(jobId: string, jobWrapper: EnvMetadata): void {
    this.jobs.set(jobId, jobWrapper);
  }

  private _deleteJob(jobId: string): void {
    this.jobs.delete(jobId);
  }

  public terminate(jobId: string): void {
    const jobWrapper = this.jobs.get(jobId);

    if (!jobWrapper) {
      throw new Error(`Job with id "${jobId}" not found.`);
    }

    const snapId = this.jobToSnapMap.get(jobId);

    if (!snapId) {
      throw new Error(`Failed to find a snap for job with id "${jobId}"`);
    }

    Object.values(jobWrapper.streams).forEach((stream) => {
      try {
        if (stream && !stream.destroyed) {
          stream.destroy();
          stream.removeAllListeners();
        }
      } catch (err) {
        console.log('Error while destroying stream', err);
      }
    });
    document.getElementById(jobWrapper.id)?.remove();
    clearTimeout(this._timeoutForUnresponsiveMap.get(snapId));
    this._timeoutForUnresponsiveMap.delete(snapId);
    this._removeSnapAndJobMapping(jobId);
    this._deleteJob(jobId);
    console.log(`job: "${jobId}" terminated`);
  }

  protected async _initJob(): Promise<EnvMetadata> {
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
        const snapId = this.jobToSnapMap.get(jobId);
        if (snapId) {
          this._messenger.publish(
            'ServiceMessenger:unhandledError',
            snapId,
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
