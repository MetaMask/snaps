// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type { BasePostMessageStream } from '@metamask/post-message-stream';

import type { Job, ExecutionServiceArgs } from '../AbstractExecutionService';
import { AbstractExecutionService } from '../AbstractExecutionService';
import { ProxyPostMessageStream } from '../ProxyPostMessageStream';
import { snapsContext } from './SnapsContext';

export class WebviewExecutionService extends AbstractExecutionService<Window> {
  #snapDuplexMap?: ProxyPostMessageStream[];

  constructor({ messenger, setupSnapProvider }: ExecutionServiceArgs) {
    super({
      messenger,
      setupSnapProvider,
    });
    this.#snapDuplexMap = [];
  }

  protected async initEnvStream(jobId: string): Promise<{
    worker: Window;
    stream: BasePostMessageStream;
  }> {
    const { stream, webview: iframeWindow } = snapsContext;

    // The WebviewExecutionService wraps the stream into a Duplex
    // to pass the jobId to the Proxy Service

    if (!stream) {
      throw new Error('No stream found in snaps context');
    }

    const snapStream = new ProxyPostMessageStream({
      stream,
      jobId,
    });

    if (!this.#snapDuplexMap) {
      throw new Error('No snap duplex map found');
    }
    this.#snapDuplexMap[jobId] = snapStream;

    return { worker: iframeWindow, stream: snapStream };
  }

  protected terminateJob(jobWrapper: Job<Window>): void {
    if (!this.#snapDuplexMap) {
      throw new Error('No snap duplex map found');
    }
    this.#snapDuplexMap[jobWrapper.id].destroy();
    delete this.#snapDuplexMap[jobWrapper.id];
  }
}
