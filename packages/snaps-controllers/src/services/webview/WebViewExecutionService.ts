import type { WebViewInterface } from './WebViewMessageStream';
import { WebViewMessageStream } from './WebViewMessageStream';
import { AbstractExecutionService } from '../AbstractExecutionService';
import type {
  ExecutionServiceArgs,
  TerminateJobArgs,
} from '../AbstractExecutionService';

export type WebViewExecutionServiceArgs = ExecutionServiceArgs & {
  createWebView: (jobId: string) => Promise<WebViewInterface>;
  removeWebView: (jobId: string) => void;
};

export class WebViewExecutionService extends AbstractExecutionService<WebViewInterface> {
  readonly #createWebView;

  readonly #removeWebView;

  constructor({
    messenger,
    setupSnapProvider,
    createWebView,
    removeWebView,
    ...args
  }: WebViewExecutionServiceArgs) {
    super({
      ...args,
      messenger,
      setupSnapProvider,
    });
    this.#createWebView = createWebView;
    this.#removeWebView = removeWebView;
  }

  /**
   * Create a new stream for the specified Snap. This wraps the runtime stream
   * in a stream specific to the Snap.
   *
   * @param snapId - The Snap ID.
   * @returns An object with the webview and stream.
   */
  protected async initEnvStream(snapId: string) {
    this.setSnapStatus(snapId, 'initializing');

    const webView = await this.#createWebView(snapId);

    const stream = new WebViewMessageStream({
      name: 'parent',
      target: 'child',
      webView,
    });

    return { worker: webView, stream };
  }

  protected async terminateJob(
    jobWrapper: TerminateJobArgs<WebViewInterface>,
  ): Promise<void> {
    this.#removeWebView(jobWrapper.id);
  }
}
