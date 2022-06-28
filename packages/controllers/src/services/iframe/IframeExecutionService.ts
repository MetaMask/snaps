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
      targetOrigin: '*',
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
   * Creates the iframe to be used as the execution environment. This may run
   * forever if the iframe never loads, but the promise should be wrapped in
   * an initialization timeout in the SnapController.
   *
   * @param uri - The iframe URI.
   * @param jobId - The job id.
   * @returns A promise that resolves to the contentWindow of the iframe.
   */
  private _createWindow(uri: string, jobId: string): Promise<Window> {
    return new Promise((resolve, reject) => {
      const iframe = document.createElement('iframe');
      // The order of operations appears to matter for everything except this
      // attribute. We may as well set it here.
      iframe.setAttribute('id', jobId);

      // In the past, we've had problems that appear to be symptomatic of the
      // iframe firing the `load` event before its scripts are actually loaded,
      // which has prevented snaps from executing properly. Therefore, we set
      // the `src` attribute and append the iframe to the DOM before attaching
      // the `load` listener.
      //
      // `load` should only fire when "all dependent resources" have been
      // loaded, which includes scripts.
      //
      // MDN article for `load` event: https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
      // Re: `load` firing twice: https://stackoverflow.com/questions/10781880/dynamically-created-iframe-triggers-onload-event-twice/15880489#15880489
      iframe.setAttribute('src', uri);
      document.body.appendChild(iframe);

      iframe.addEventListener('load', () => {
        if (iframe.contentWindow) {
          resolve(iframe.contentWindow);
        } else {
          // We don't know of a case when this would happen, but better to fail
          // fast if it does.
          reject(
            new Error(
              `iframe.contentWindow not present on load for job "${jobId}".`,
            ),
          );
        }
      });

      // We need to set the sandbox attribute after appending the iframe to the
      // DOM, otherwise errors in the iframe will not be propagated via `error`
      // and `unhandledrejection` events, and we cannot catch and handle them.
      // We wish we knew why this was the case.
      //
      // We set this property after adding the `load` listener because it
      // appears to work dependably. ¯\_(ツ)_/¯
      //
      // We apply this property as a principle of least authority (POLA)
      // measure.
      // Ref: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-sandbox
      iframe.setAttribute('sandbox', 'allow-scripts');
    });
  }
}
