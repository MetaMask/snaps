import {
  BasePostMessageStream,
  WindowPostMessageStream,
} from '@metamask/post-message-stream';
import { createWindow } from '@metamask/snaps-utils';
import { nanoid } from 'nanoid';

import {
  AbstractExecutionService,
  ExecutionServiceArgs,
  Job,
} from '../AbstractExecutionService';
import { WebWorkerPostMessageStream } from './WebWorkerPostMessageStream';

type WebWorkerExecutionEnvironmentServiceArgs = {
  documentUrl: URL;
} & ExecutionServiceArgs;

export class WebWorkerExecutionService extends AbstractExecutionService<string> {
  public readonly documentUrl: URL;

  readonly #runtimeStream: BasePostMessageStream;

  /**
   * Create a new webworker execution service.
   *
   * @param args - The constructor arguments.
   * @param args.documentUrl - The URL of the worker pool document to use as the
   * execution environment.
   * @param args.messenger - The messenger to use for communication with the
   * `SnapController`.
   * @param args.setupSnapProvider - The function to use to set up the snap
   * provider.
   */
  constructor({
    documentUrl,
    messenger,
    setupSnapProvider,
  }: WebWorkerExecutionEnvironmentServiceArgs) {
    super({
      messenger,
      setupSnapProvider,
    });

    this.documentUrl = documentUrl;
    this.#runtimeStream = new WindowPostMessageStream({
      name: 'parent',
      target: 'child',
    });
  }

  /**
   * Send a termination command to the worker pool document.
   *
   * @param job - The job to terminate.
   */
  protected async terminateJob(job: Job<string>) {
    // The `AbstractExecutionService` will have already closed the job stream,
    // so we write to the runtime stream directly.
    this.#runtimeStream.write({
      jobId: job.id,
      data: {
        jsonrpc: '2.0',
        method: 'terminateJob',
        id: nanoid(),
      },
    });
  }

  /**
   * Create a new stream for the specified job. This wraps the runtime stream
   * in a stream specific to the job.
   *
   * @param jobId - The job ID.
   */
  protected async initEnvStream(jobId: string) {
    // Lazily create the worker pool document.
    await this.createDocument();

    const stream = new WebWorkerPostMessageStream({
      stream: this.#runtimeStream,
      jobId,
    });

    return { worker: jobId, stream };
  }

  /**
   * Creates the worker pool document to be used as the execution environment.
   *
   * If the document already exists, this does nothing.
   */
  private async createDocument() {
    // We only want to create a single pool.
    if (document.getElementById('pool')) {
      return;
    }

    await createWindow(this.documentUrl.href, 'pool');
  }
}
