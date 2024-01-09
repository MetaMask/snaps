import type { BasePostMessageStream } from '@metamask/post-message-stream';

import type { Job, ExecutionServiceArgs } from '../AbstractExecutionService';
import { AbstractExecutionService } from '../AbstractExecutionService';
import { ProxyPostMessageStream } from '../ProxyPostMessageStream';

type WebviewExecutionServiceArgs = {
  stream: BasePostMessageStream;
  webview: Window;
} & ExecutionServiceArgs;

/**
 * Execution service for React Native Webview.
 * Usage:
 * ```ts
 *    const snapExecutionServiceArgs = {
 *      stream: webviewStream,
 *      webview: webviewRef.current,
 *      messenger: this.controllerMessenger.getRestricted({
 *        name: 'ExecutionService',
 *      }),
 *    setupSnapProvider: this.setupSnapProvider.bind(this),
 *    };
 *  this.executionService = new WebviewExecutionService(snapExecutionServiceArgs);
 * ```
 */

export class WebviewExecutionService extends AbstractExecutionService<Window> {
  /**
   * Background stream created by React Native Webview when the mobile app is loaded.
   * WebviewExecutionService uses this stream to estabilish communication between RPC calls comming from dApps,
   * forwarding and handling inside the webview's snaps respective iFrame.
   */
  public readonly stream: BasePostMessageStream;

  /**
   * React Native Webview's window reference, created when mobile app is loaded.
   */
  public readonly webview: Window;

  readonly #snapDuplexMap: Map<string, ProxyPostMessageStream>;

  constructor({
    messenger,
    setupSnapProvider,
    stream,
    webview,
  }: WebviewExecutionServiceArgs) {
    super({
      messenger,
      setupSnapProvider,
    });
    this.stream = stream;
    this.webview = webview;
    this.#snapDuplexMap = new Map();
  }

  protected async initEnvStream(jobId: string): Promise<{
    worker: Window;
    stream: BasePostMessageStream;
  }> {
    if (!this.stream) {
      throw new Error('No stream found in snaps context');
    }

    const snapStream = new ProxyPostMessageStream({
      stream: this.stream,
      jobId,
    });

    if (!this.#snapDuplexMap) {
      throw new Error('No snap duplex map found');
    }
    this.#snapDuplexMap.set(jobId, snapStream);

    return { worker: this.webview, stream: snapStream };
  }

  protected terminateJob(jobWrapper: Job<Window>): void {
    if (!this.#snapDuplexMap) {
      throw new Error('No snap duplex map found');
    }
    this.#snapDuplexMap.get(jobWrapper.id)?.destroy();
    this.#snapDuplexMap.delete(jobWrapper.id);
  }
}
