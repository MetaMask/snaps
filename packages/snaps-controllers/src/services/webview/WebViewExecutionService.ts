import type { TerminateJobArgs } from '../AbstractExecutionService';
import {
  AbstractExecutionService,
  type ExecutionServiceArgs,
} from '../AbstractExecutionService';
import type { WebViewInterface } from './WebViewMessageStream';
import { WebViewMessageStream } from './WebViewMessageStream';

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
   * Create a new stream for the specified job. This wraps the runtime stream
   * in a stream specific to the job.
   *
   * @param jobId - The job ID.
   * @returns An object with the worker ID and stream.
   */
  protected async initEnvStream(jobId: string) {
    const webView = await this.#createWebView(jobId);

    const stream = new WebViewMessageStream({
      name: 'parent',
      target: 'child',
      webView,
    });

    return { worker: webView, stream };
  }

  protected terminateJob(jobWrapper: TerminateJobArgs<WebViewInterface>): void {
    this.#removeWebView(jobWrapper.id);
  }
}
