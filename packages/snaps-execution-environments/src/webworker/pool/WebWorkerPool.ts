import {
  BasePostMessageStream,
  WebWorkerParentPostMessageStream,
  WindowPostMessageStream,
} from '@metamask/post-message-stream';
import { logError } from '@metamask/snaps-utils';
import { JsonRpcRequest, assert } from '@metamask/utils';

type ExecutorJob = {
  id: string;
  worker: Worker;
  stream: WebWorkerParentPostMessageStream;
};

/**
 * A snap executor using the WebWorker API.
 *
 * This is not a traditional snap executor, as it does not execute snaps itself.
 * Instead, it creates a pool of webworkers for each snap execution, and sends
 * the snap execution request to the webworker. The webworker is responsible for
 * executing the snap.
 */
export class WebWorkerPool {
  readonly #poolSize = 3;

  readonly #stream: BasePostMessageStream;

  readonly #url: string;

  readonly pool: Worker[] = [];

  readonly jobs: Map<string, ExecutorJob> = new Map();

  #workerSourceURL?: string;

  static initialize(
    stream: BasePostMessageStream = new WindowPostMessageStream({
      name: 'child',
      target: 'parent',
      targetWindow: self.parent,
      targetOrigin: '*',
    }),
    url = '../executor/bundle.js',
  ) {
    return new WebWorkerPool(stream, url);
  }

  constructor(stream: BasePostMessageStream, url: string) {
    this.#stream = stream;
    this.#url = url;

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
    const { jobId, data: request } = data;

    const job = this.jobs.get(jobId);
    if (!job) {
      // This ensures that a job is initialized before it is used. To avoid
      // code duplication, we call the `#onData` method again, which will
      // run the rest of the logic after initialization.
      this.#initializeJob(jobId)
        .then(() => {
          this.#onData(data);
        })
        .catch((error) => {
          logError('[Worker] Error initializing job:', error.toString());
        });

      return;
    }

    // This is a method specific to the `WebWorkerPool`, as the service itself
    // does not have access to the iframes directly.
    if (request.method === 'terminateJob') {
      this.#terminateJob(jobId);
      return;
    }

    job.stream.write(request);
  }

  /**
   * Create a new iframe and set up a stream to communicate with it.
   *
   * @param jobId - The job ID.
   * @returns The job.
   */
  async #initializeJob(jobId: string): Promise<ExecutorJob> {
    const worker = await this.#getWorker();
    const jobStream = new WebWorkerParentPostMessageStream({
      worker,
    });

    // Write messages from the worker to the parent, wrapped with the job ID.
    jobStream.on('data', (data) => {
      this.#stream.write({ data, jobId });
    });

    const job = { id: jobId, worker, stream: jobStream };
    this.jobs.set(jobId, job);
    return job;
  }

  /**
   * Terminate the job with the given ID. This will close the iframe and delete
   * the job from the internal job map.
   *
   * @param jobId - The job ID.
   */
  #terminateJob(jobId: string) {
    const job = this.jobs.get(jobId);
    assert(job, `Job "${jobId}" not found.`);

    job.stream.destroy();
    job.worker.terminate();

    this.jobs.delete(jobId);
  }

  /**
   * Get a worker from the pool. A new worker will be created automatically.
   *
   * @returns The worker.
   */
  async #getWorker() {
    // Lazily create the pool of workers.
    if (this.pool.length === 0) {
      await this.#updatePool();
    }

    const worker = this.pool.shift();
    assert(worker, 'Worker not found.');

    await this.#updatePool();

    return worker;
  }

  /**
   * Update the pool of workers. This will create new workers if the pool is
   * below the minimum size.
   */
  async #updatePool() {
    while (this.pool.length < this.#poolSize) {
      const worker = await this.#createWorker();
      this.pool.push(worker);
    }
  }

  /**
   * Create a new worker. This will fetch the worker source if it has not
   * already been fetched.
   *
   * @returns The worker.
   */
  async #createWorker() {
    return new Worker(await this.#getWorkerURL(), {
      name: `worker-${this.pool.length}`,
    });
  }

  /**
   * Get the URL of the worker source. This will fetch the worker source if it
   * has not already been fetched.
   *
   * @returns The worker source URL, as a `blob:` URL.
   */
  async #getWorkerURL() {
    if (this.#workerSourceURL) {
      return this.#workerSourceURL;
    }

    const blob = await fetch(this.#url)
      .then(async (response) => response.blob())
      .then(URL.createObjectURL.bind(URL));

    this.#workerSourceURL = blob;
    return blob;
  }
}
