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
    ...args
  }: OffscreenExecutionEnvironmentServiceArgs) {
    super({
      ...args,
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
   * Create a new stream for the given Snap ID. This will wait for the offscreen
   * environment to be ready before creating the stream.
   *
   * @param snapId - The Snap ID to create a stream for.
   * @returns The stream for the given Snap ID.
   */
  protected async initEnvStream(snapId: string) {
    await this.#offscreenPromise;

    return await super.initEnvStream(snapId);
  }
}
