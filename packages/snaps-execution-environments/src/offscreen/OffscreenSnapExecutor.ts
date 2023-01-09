import {
  BasePostMessageStream,
  WindowPostMessageStream,
} from '@metamask/post-message-stream';
import { createWindow } from '@metamask/snaps-utils';
import { JsonRpcRequest, assert } from '@metamask/utils';

type ExecutorJob = {
  id: string;
  window: Window;
  stream: WindowPostMessageStream;
};

export class OffscreenSnapExecutor {
  readonly #stream: BasePostMessageStream;

  readonly jobs: Record<string, ExecutorJob> = {};

  /**
   * Initialize the executor with the given stream. This is a wrapper around the
   * constructor.
   *
   * @param stream - The stream to use for communication.
   * @returns The initialized executor.
   */
  static initialize(stream: BasePostMessageStream) {
    return new OffscreenSnapExecutor(stream);
  }

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
   * @param data.frameUrl - The URL to load in the iframe.
   */
  #onData(data: { data: JsonRpcRequest; jobId: string; frameUrl: string }) {
    const { jobId, frameUrl, data: request } = data;

    if (!this.jobs[jobId]) {
      // This ensures that a job is initialized before it is used. To avoid
      // code duplication, we call the `#onData` method again, which will
      // run the rest of the logic after initialization.
      this.#initializeJob(jobId, frameUrl)
        .then(() => {
          this.#onData(data);
        })
        .catch((error) => {
          console.error('[Worker] Error initializing job:', error);
        });

      return;
    }

    // This is a method specific to the `OffscreenSnapExecutor`, as the service
    // itself does not have access to the iframes directly.
    if (request.method === 'terminateJob') {
      this.#terminateJob(jobId);
      return;
    }

    this.jobs[jobId].stream.write(request);
  }

  /**
   * Create a new iframe and set up a stream to communicate with it.
   *
   * @param jobId - The job ID.
   * @param frameUrl - The URL to load in the iframe.
   */
  async #initializeJob(jobId: string, frameUrl: string): Promise<ExecutorJob> {
    const window = await createWindow(frameUrl, jobId);
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

    this.jobs[jobId] = { id: jobId, window, stream: jobStream };
    return this.jobs[jobId];
  }

  /**
   * Terminate the job with the given ID. This will close the iframe and delete
   * the job from the internal job map.
   *
   * @param jobId - The job ID.
   */
  #terminateJob(jobId: string) {
    assert(this.jobs[jobId], `Job "${jobId}" not found.`);

    const iframe = document.getElementById(jobId);
    assert(iframe?.parentNode, `Iframe with ID "${jobId}" not found.`);

    iframe.remove();
    this.jobs[jobId].stream.destroy();
    delete this.jobs[jobId];
  }
}
