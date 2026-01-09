import type { BasePostMessageStream } from '@metamask/post-message-stream';
import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { createWindow } from '@metamask/snaps-utils';

import type {
  ExecutionServiceArgs,
  TerminateJobArgs,
} from '../AbstractExecutionService';
import { AbstractExecutionService } from '../AbstractExecutionService';

type IframeExecutionEnvironmentServiceArgs = {
  iframeUrl: URL;
} & ExecutionServiceArgs;

export class IframeExecutionService extends AbstractExecutionService<Window> {
  public iframeUrl: URL;

  constructor({
    iframeUrl,
    messenger,
    setupSnapProvider,
    ...args
  }: IframeExecutionEnvironmentServiceArgs) {
    super({
      ...args,
      messenger,
      setupSnapProvider,
    });
    this.iframeUrl = iframeUrl;
  }

  protected async terminateJob(
    jobWrapper: TerminateJobArgs<Window>,
  ): Promise<void> {
    const iframe = document.getElementById(
      jobWrapper.id,
    ) as HTMLIFrameElement | null;

    if (!iframe) {
      return;
    }

    iframe.id = '';
    iframe.src = 'about:blank';

    await new Promise((resolve) => setTimeout(resolve, 10));

    iframe.remove();
  }

  protected async initEnvStream(snapId: string): Promise<{
    worker: Window;
    stream: BasePostMessageStream;
  }> {
    this.setSnapStatus(snapId, 'initializing');

    const iframeWindow = await createWindow({
      uri: this.iframeUrl.toString(),
      id: snapId,
    });

    const stream = new WindowPostMessageStream({
      name: 'parent',
      target: 'child',
      targetWindow: iframeWindow,
      targetOrigin: '*',
    });

    return { worker: iframeWindow, stream };
  }
}
