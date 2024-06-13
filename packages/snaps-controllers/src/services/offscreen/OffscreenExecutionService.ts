import { BrowserRuntimePostMessageStream } from '@metamask/post-message-stream';

import type { ExecutionServiceArgs } from '../AbstractExecutionService';
import { ProxyExecutionService } from '../proxy/ProxyExecutionService';

type OffscreenExecutionEnvironmentServiceArgs = {
  offscreenPromise: Promise<unknown>;
} & ExecutionServiceArgs;

export class OffscreenExecutionService extends ProxyExecutionService {
  readonly #offscreenPromise: Promise<unknown>;

  /**
   * Create a new offscreen execution service.
   *
   * @param args - The constructor arguments.
   * @param args.messenger - The messenger to use for communication with the
   * `SnapController`.
   * @param args.setupSnapProvider - The function to use to set up the snap
   * provider.
   * @param args.offscreenPromise - A promise that resolves when the offscreen
   * environment is ready.
   */
  constructor({
    messenger,
    setupSnapProvider,
    offscreenPromise,
  }: OffscreenExecutionEnvironmentServiceArgs) {
    super({
      messenger,
      setupSnapProvider,
      stream: new BrowserRuntimePostMessageStream({
        name: 'parent',
        target: 'child',
      }),
    });

    this.#offscreenPromise = offscreenPromise;
  }

  /**
   * Create a new stream for the given job ID. This will wait for the offscreen
   * environment to be ready before creating the stream.
   *
   * @param jobId - The job ID to create a stream for.
   * @returns The stream for the given job ID.
   */
  protected async initEnvStream(jobId: string) {
    await this.#offscreenPromise;

    return await super.initEnvStream(jobId);
  }
}
