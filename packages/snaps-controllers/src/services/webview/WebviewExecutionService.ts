// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

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
    this.#snapDuplexMap = {};
  }

  protected async initEnvStream(jobId: string): Promise<{
    worker: Window;
    stream: ProxyPostMessageStream;
  }> {
    const iframeWindow = snapsContext.webview;
    const { stream } = snapsContext;

    // The WebviewExecutionService wraps the stream into a Duplex
    // to pass the jobId to the Proxy Service

    const snapStream = new ProxyPostMessageStream({
      stream,
      jobId,
    });

    this.#snapDuplexMap[jobId] = snapStream;

    return { worker: iframeWindow, stream: snapStream };
  }

  protected terminateJob(jobWrapper: Job<Window>): void {
    this.#snapDuplexMap[jobWrapper.id].destroy();
    delete this.#snapDuplexMap[jobWrapper.id];
  }
}
