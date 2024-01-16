import type { BasePostMessageStream } from '@metamask/post-message-stream';
import { nanoid } from 'nanoid';

import type { ExecutionServiceArgs, Job } from '../AbstractExecutionService';
import { AbstractExecutionService } from '../AbstractExecutionService';
import { ProxyPostMessageStream } from '../ProxyPostMessageStream';

type ProxyExecutionEnvironmentServiceArgs = {
  stream: BasePostMessageStream;
} & ExecutionServiceArgs;

export class ProxyExecutionService extends AbstractExecutionService<string> {
  readonly #stream: BasePostMessageStream;

  /**
   * Create a new proxy execution service.
   *
   * @param args - The constructor arguments.
   * @param args.messenger - The messenger to use for communication with the
   * `SnapController`.
   * @param args.setupSnapProvider - The function to use to set up the snap
   * provider.
   * @param args.stream - The stream to use for communicating with the proxy
   * executor.
   */
  constructor({
    stream,
    messenger,
    setupSnapProvider,
  }: ProxyExecutionEnvironmentServiceArgs) {
    super({
      messenger,
      setupSnapProvider,
    });

    this.#stream = stream;
  }

  /**
   * Send a termination command to the proxy stream.
   *
   * @param job - The job to terminate.
   */
  protected async terminateJob(job: Job<string>) {
    // The `AbstractExecutionService` will have already closed the job stream,
    // so we write to the runtime stream directly.
    this.#stream.write({
      jobId: job.id,
      data: {
        jsonrpc: '2.0',
        method: 'terminateJob',
        id: nanoid(),
      },
    });
  }

  /**
   * Create a new stream for the specified job. This wraps the root stream
   * in a stream specific to the job.
   *
   * @param jobId - The job ID.
   */
  protected async initEnvStream(jobId: string) {
    const stream = new ProxyPostMessageStream({
      stream: this.#stream,
      jobId,
    });

    return { worker: jobId, stream };
  }
}
