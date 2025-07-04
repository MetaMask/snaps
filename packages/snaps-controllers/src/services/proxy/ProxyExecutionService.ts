import type { BasePostMessageStream } from '@metamask/post-message-stream';
import { nanoid } from 'nanoid';

import type {
  ExecutionServiceArgs,
  TerminateJobArgs,
} from '../AbstractExecutionService';
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
    ...args
  }: ProxyExecutionEnvironmentServiceArgs) {
    super({
      ...args,
      messenger,
      setupSnapProvider,
      usePing: false,
    });

    this.#stream = stream;
  }

  /**
   * Send a termination command to the proxy stream.
   *
   * @param job - The job to terminate.
   */
  // TODO: Either fix this lint violation or explain why it's necessary to
  //  ignore.
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  protected async terminateJob(job: TerminateJobArgs<string>) {
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
   * Create a new stream for the specified Snap. This wraps the root stream
   * in a stream specific to the Snap.
   *
   * @param snapId - The Snap ID.
   * @returns An object with the worker ID and stream.
   */
  protected async initEnvStream(snapId: string) {
    this.setSnapStatus(snapId, 'initializing');

    const stream = new ProxyPostMessageStream({
      stream: this.#stream,
      jobId: snapId,
    });

    // Send a request and await any response before continuing
    // This simulates the behaviour of non-proxy environments by effectively awaiting
    // the load of the environment inside the proxy environment
    // This assumes the proxy environment is already loaded before this function is called
    await new Promise((resolve) => {
      stream.once('data', resolve);
      stream.write({
        name: 'command',
        data: { jsonrpc: '2.0', method: 'ping', id: nanoid() },
      });
    });

    return { worker: snapId, stream };
  }
}
