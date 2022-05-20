import { Duplex } from 'stream';
import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { ExecutionServiceMessenger } from '@metamask/snap-types';
import { SNAP_STREAM_NAMES } from '@metamask/execution-environments';
import { JsonRpcEngine } from 'json-rpc-engine';
import { createStreamMiddleware } from 'json-rpc-middleware-stream';
import { nanoid } from 'nanoid';
import pump from 'pump';
import {
  AbstractExecutionService,
  setupMultiplex,
  SetupSnapProvider,
} from '../AbstractExecutionService';

type IframeExecutionEnvironmentServiceArgs = {
  createWindowTimeout?: number;
  setupSnapProvider: SetupSnapProvider;
  iframeUrl: URL;
  messenger: ExecutionServiceMessenger;
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

export class IframeExecutionService extends AbstractExecutionService<EnvMetadata> {
  public _iframeWindow?: Window;

  public iframeUrl: URL;

  constructor({
    setupSnapProvider,
    iframeUrl,
    messenger,
  }: IframeExecutionEnvironmentServiceArgs) {
    super({
      setupSnapProvider,
      messenger,
    });
    this.iframeUrl = iframeUrl;
  }

  protected _terminate(jobWrapper: EnvMetadata): void {
    document.getElementById(jobWrapper.id)?.remove();
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
    this.jobs.set(jobId, envMetadata);

    return envMetadata;
  }

  private async _initStreams(jobId: string): Promise<any> {
    this._iframeWindow = await this._createWindow(
      this.iframeUrl.toString(),
      jobId,
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
            'ExecutionService:unhandledError',
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

  /**
   * Creates the iframe to be used as the execution environment
   * This may run forever if the iframe never loads, but the promise should be wrapped in an initialization timeout in the SnapController
   *
   * @param uri - The iframe URI
   * @param jobId - The job id
   */
  private _createWindow(uri: string, jobId: string): Promise<Window> {
    const iframe = document.createElement('iframe');
    return new Promise((resolve) => {
      iframe.addEventListener('load', () => {
        if (iframe.contentWindow) {
          resolve(iframe.contentWindow);
        }
      });
      // Set attributes before adding the iframe to the DOM to trigger 'load' event once everything has been loaded.
      iframe.setAttribute('src', uri);
      iframe.setAttribute('id', jobId);
      iframe.setAttribute('sandbox', 'allow-scripts');
      document.body.appendChild(iframe);
    });
  }
}
