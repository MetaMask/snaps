import type { BasePostMessageStream } from '@metamask/post-message-stream';

import type { ExecutionServiceArgs } from '../AbstractExecutionService';
import { ProxyExecutionService } from '../proxy/ProxyExecutionService';

type WebviewExecutionServiceArgs = {
  stream: BasePostMessageStream;
  frameUrl: URL;
} & ExecutionServiceArgs;

export class WebviewExecutionService extends ProxyExecutionService {
  constructor({
    messenger,
    setupSnapProvider,
    stream,
    frameUrl,
  }: WebviewExecutionServiceArgs) {
    super({
      messenger,
      setupSnapProvider,
      stream,
      frameUrl,
    });
  }
}
