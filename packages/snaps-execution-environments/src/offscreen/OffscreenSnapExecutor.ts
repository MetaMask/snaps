import {
  BasePostMessageStream,
  WindowPostMessageStream,
} from '@metamask/post-message-stream';
import { JsonRpcParams, JsonRpcRequest } from '@metamask/utils';

// TODO: This should be configurable somehow.
const IFRAME_URL =
  'https://metamask.github.io/iframe-execution-environment/0.11.1/';

type ExecutorJob = {
  id: string;
  window: Window;
  stream: WindowPostMessageStream;
};

export class OffscreenSnapExecutor {
  readonly #stream: BasePostMessageStream;

  readonly #jobs: Record<string, ExecutorJob> = {};

  constructor(stream: BasePostMessageStream) {
    this.#stream = stream;
    this.#stream.on('data', this.#onData.bind(this));
  }

  /**
   * Handle an incoming message from the `OffscreenExecutionService`. This
   * assumes that the message contains a `jobId` property, and a JSON-RPC
   * request in the `data` property.
   *
   * @param data - The message data.
   * @param data.data - The JSON-RPC request.
   * @param data.jobId - The job ID.
   */
  #onData(data: { data: JsonRpcRequest<JsonRpcParams>; jobId: string }) {
    const { jobId, data: request } = data;

    if (!this.#jobs[jobId]) {
      // This ensures that a job is initialized before it is used. To avoid
      // code duplication, we call the `#onData` method again, which will
      // run the rest of the logic after initialization.
      this.#initializeJob(jobId)
        .then(() => {
          this.#onData(data);
        })
        .catch((error) => {
          console.error('[Worker] Error initializing job:', error);
        });

      return;
    }

    if (request.method === 'terminateJob') {
      this.#terminateJob(jobId);
      return;
    }

    this.#jobs[jobId].stream.write(request);
  }

  /**
   * Create a new iframe and set up a stream to communicate with it.
   *
   * @param jobId - The job ID.
   */
  async #initializeJob(jobId: string): Promise<ExecutorJob> {
    const window = await this.#createWindow(IFRAME_URL, jobId);
    const jobStream = new WindowPostMessageStream({
      name: 'parent',
      target: 'child',
      targetWindow: window,
      targetOrigin: '*',
    });

    // Write messages from the iframe to the parent, wrapped with the job ID.
    jobStream.on('data', (data) => {
      this.#stream.write({ data, jobId });
    });

    this.#jobs[jobId] = { id: jobId, window, stream: jobStream };
    return this.#jobs[jobId];
  }

  /**
   * Terminate the job with the given ID. This will close the iframe and delete
   * the job from the internal job map.
   *
   * @param jobId - The job ID.
   */
  #terminateJob(jobId: string) {
    assert(this.#jobs[jobId], `Job "${jobId}" not found.`);

    const iframe = document.getElementById(jobId);
    assert(iframe?.parentNode, `Iframe with ID "${jobId}" not found.`);

    iframe.parentNode.removeChild(iframe);
    this.#jobs[jobId].stream.destroy();
    delete this.#jobs[jobId];
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
  // TODO: Move this to a reusable utility, as it is also used in the iframe
  // execution service.
  async #createWindow(uri: string, jobId: string): Promise<Window> {
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
