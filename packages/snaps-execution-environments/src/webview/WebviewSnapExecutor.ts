import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { createWindow, logError, logInfo } from '@metamask/snaps-utils';
import type { JsonRpcRequest } from '@metamask/utils';
import { assert } from '@metamask/utils';

import type { ProxyMessageStream } from './ProxyMessageStream';

type IJob = {
  id: string;
  window: Window;
  stream: WindowPostMessageStream;
  terminateNext?: string;
};

type ExecutionControllerArgs = {
  proxyService: ProxyMessageStream;
};

/**
 * The URL of the iframe execution environment.
 * TODO: This should be configurable, received via params.
 */
const IFRAME_URL =
  'https://metamask.github.io/iframe-execution-environment/0.11.1';

/**
 * A snap executor using the Webview API.
 *
 * This is not a traditional snap executor, as it does not execute snaps itself.
 * Instead, it creates an iframe window for each snap execution, and sends the
 * snap execution request to the iframe window. The iframe window is responsible
 * for executing the snap.
 *
 * Webviews can only have a single document, so this executor is
 * persisted between snap executions. The Webview snap executor essentially
 * acts as a proxy between the extension and the iframe execution environment.
 *
 * @see https://github.com/react-native-webview/react-native-webview
 */
export class WebviewSnapExecutor {
  readonly #jobs: Record<string, IJob>;

  readonly #proxyService: ProxyMessageStream;

  /**
   * Initialize the executor with the given stream. This is a wrapper around the
   * constructor.
   *
   * @param proxyService - The proxy service to use for communication.
   * @returns The initialized executor.
   */
  static initialize(proxyService: ProxyMessageStream): WebviewSnapExecutor {
    return new WebviewSnapExecutor({ proxyService });
  }

  constructor({ proxyService }: ExecutionControllerArgs) {
    this.#jobs = {};
    this.#proxyService = proxyService;
  }

  /**
   * Handle an incoming message from the `WebviewExecutionService`. This
   * assumes that the message contains a `jobId` property, and a JSON-RPC
   * request in the `data` property.
   *
   * @param data - The message data.
   * @param data.data - The JSON-RPC request.
   * @param data.jobId - The job ID.
   */
  #onData(data: { data: JsonRpcRequest; jobId: string }) {
    const { jobId, data: request } = data;

    logInfo('[WEBVIEW.SNAP.EXECUTOR - onData]:', data);

    if (!this.#jobs[jobId]) {
      // This ensures that a job is initialized before it is used. To avoid
      // code duplication, we call the `#onData` method again, which will
      // run the rest of the logic after initialization.
      this.#initializeJob(jobId)
        .then(() => {
          this.#onData(data);
        })
        .catch((error) => {
          logError('[Worker] Error initializing job:', error);
        });

      return;
    }

    // This is a method specific to the `WebviewSnapExecutor`, as the service
    // itself does not have access to the iframes directly.
    if (request.method === 'terminate') {
      this.#terminateJob(jobId);
      return;
    }

    logInfo('[WEBVIEW.SNAP.EXECUTOR - request]:', request);

    this.#jobs[jobId].stream.write(request);
  }

  /**
   * Create a new iframe and set up a stream to communicate with it.
   *
   * @param jobId - The job ID.
   */
  async #initializeJob(jobId: string): Promise<IJob> {
    const window = await createWindow(IFRAME_URL, jobId);

    logInfo('[WEBVIEW.SNAP.EXECUTOR - window elements]:', {
      IFRAME_URL,
      jobId,
    });

    const jobStream = new WindowPostMessageStream({
      name: 'parent',
      target: 'child',
      targetWindow: window,
      targetOrigin: '*',
    });

    logInfo('[WEBVIEW.SNAP.EXECUTOR - jobStream]:', Boolean(jobStream));

    // Write messages from the iframe to the parent, wrapped with the job ID.
    jobStream.on('data', (data: any) => {
      this.#proxyService.write({ data, jobId });
      this.#handleJobDeletion({ data, jobId });
    });

    this.#jobs[jobId] = { id: jobId, window, stream: jobStream };
    return this.#jobs[jobId];
  }

  #handleJobDeletion({ jobId, data }: { jobId: string; data: any }): void {
    const job = this.#jobs[jobId];
    if (job?.terminateNext && job?.terminateNext === data?.data?.id) {
      this.#terminateJob(jobId);
    }
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
    assert(iframe, `Iframe with ID "${jobId}" not found.`);

    iframe.remove();
    this.#jobs[jobId].stream.destroy();
    delete this.#jobs[jobId];
  }
}
