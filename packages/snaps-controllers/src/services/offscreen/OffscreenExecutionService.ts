import {
  BasePostMessageStream,
  RuntimePostMessageStream,
} from '@metamask/post-message-stream';

import {
  AbstractExecutionService,
  ExecutionServiceArgs,
} from '../AbstractExecutionService';

type OffscreenExecutionEnvironmentServiceArgs = {
  documentUrl: URL;
} & ExecutionServiceArgs;

export class OffscreenExecutionService extends AbstractExecutionService<undefined> {
  public documentUrl: URL;

  constructor({
    documentUrl,
    messenger,
    setupSnapProvider,
  }: OffscreenExecutionEnvironmentServiceArgs) {
    super({
      messenger,
      setupSnapProvider,
    });
    this.documentUrl = documentUrl;
  }

  protected async terminateJob(): Promise<void> {
    // await chrome.offscreen.closeDocument();
  }

  protected async initEnvStream(): Promise<{
    worker: undefined;
    stream: BasePostMessageStream;
  }> {
    await this.createDocument();

    const stream = new RuntimePostMessageStream({
      name: 'parent',
      target: 'child',
    });

    return { worker: undefined, stream };
  }

  /**
   * Creates the offscreen document to be used as the execution environment.
   */
  private async createDocument() {
    await chrome.offscreen.createDocument({
      justification: 'MetaMask Snaps Execution Environment',
      reasons: ['IFRAME_SCRIPTING'],
      url: this.documentUrl.toString(),
    });
  }
}
