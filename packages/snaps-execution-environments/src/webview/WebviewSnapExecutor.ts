/* eslint-disable no-irregular-whitespace */

/**
 * WebviewSnapExecutor is a class that has only one responsibility. Manage jobs.
 *
 * Each job is associated with an iframe and a communication stream.
 * The class uses the concept of private fields, denoted by #, which are only accessible within the class.
 *
 * The WebviewSnapExecutor class has two private fields: #jobs and #proxyService.
 * The #jobs field is a record (an object with string keys and IJob values) that stores the jobs managed by the executor.
 * The #proxyService field is an instance of ProxyMessageStream used for communication.
 *
 * The initialize static method is a factory method that creates a new instance of WebviewSnapExecutor.
 * It takes a ProxyMessageStream as an argument and passes it to the constructor of WebviewSnapExecutor.
 *
 * The constructor of WebviewSnapExecutor takes an object with a proxyService property as an argument.
 * It initializes the #jobs field as an empty object and the #proxyService field with the provided proxyService.
 *
 * The #onData method handles incoming messages from the WebviewExecutionService.
 * It expects a jobId and a JSON-RPC request in the data property of the message.
 * If the job with the given jobId doesn't exist, it initializes the job and then calls the #onData method again.
 * If the request method is terminate, it terminates the job. Otherwise, it writes the request to the job's stream.
 *
 * The #initializeJob method creates a new iframe and sets up a stream to communicate with it.
 * It also sets up a listener on the stream to write messages from the iframe to the parent and handle job deletion.
 *
 * The #handleJobDeletion method checks if a job should be terminated next and if so, it terminates the job.
 *
 * The #terminateJob method terminates a job with a given ID.
 * It removes the iframe associated with the job, destroys the job's stream, and deletes the job from the #jobs record.
 */

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
const IFRAME_URL = 'https://metamask.github.io/iframe-execution-environment';

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
      this.#initializeJob(jobId)
        .then(() => {
          this.#onData(data);
        })
        .catch((error) => {
          logError('[Worker] Error initializing job:', error);
        });

      return;
    }

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
