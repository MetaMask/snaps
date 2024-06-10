import { BrowserRuntimePostMessageStream } from '@metamask/post-message-stream';

import type { ExecutionServiceArgs } from '../AbstractExecutionService';
import { ProxyExecutionService } from '../proxy/ProxyExecutionService';

type OffscreenExecutionEnvironmentServiceArgs = {
  documentUrl: URL;
} & ExecutionServiceArgs;

export class OffscreenExecutionService extends ProxyExecutionService {
  /**
   * Create a new offscreen execution service.
   *
   * @param args - The constructor arguments.
   * @param args.messenger - The messenger to use for communication with the
   * `SnapController`.
   * @param args.setupSnapProvider - The function to use to set up the snap
   * provider.
   */
  constructor({
    messenger,
    setupSnapProvider,
  }: OffscreenExecutionEnvironmentServiceArgs) {
    super({
      messenger,
      setupSnapProvider,
      stream: new BrowserRuntimePostMessageStream({
        name: 'parent',
        target: 'child',
      }),
    });
  }
}
