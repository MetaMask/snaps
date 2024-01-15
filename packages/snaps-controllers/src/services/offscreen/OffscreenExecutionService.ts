import { BrowserRuntimePostMessageStream } from '@metamask/post-message-stream';

import type { ExecutionServiceArgs } from '../AbstractExecutionService';
import { ProxyExecutionService } from '../proxy/ProxyExecutionService';

type OffscreenExecutionEnvironmentServiceArgs = {
  documentUrl: URL;
} & ExecutionServiceArgs;

export class OffscreenExecutionService extends ProxyExecutionService {
  public readonly documentUrl: URL;

  /**
   * Create a new offscreen execution service.
   *
   * @param args - The constructor arguments.
   * @param args.documentUrl - The URL of the offscreen document to use as the
   * execution environment. This must be a URL relative to the location where
   * this is called. This cannot be a public (http(s)) URL.
   * @param args.messenger - The messenger to use for communication with the
   * `SnapController`.
   * @param args.setupSnapProvider - The function to use to set up the snap
   * provider.
   */
  constructor({
    documentUrl,
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

    this.documentUrl = documentUrl;
  }

  /**
   * Create a new stream for the specified job. This wraps the runtime stream
   * in a stream specific to the job.
   *
   * @param jobId - The job ID.
   */
  protected async initEnvStream(jobId: string) {
    // Lazily create the offscreen document.
    await this.#createDocument();

    return super.initEnvStream(jobId);
  }

  /**
   * Creates the offscreen document to be used as the execution environment.
   *
   * If the document already exists, this does nothing.
   */
  async #createDocument() {
    // Extensions can only have a single offscreen document.
    if (await chrome.offscreen.hasDocument()) {
      return;
    }

    await chrome.offscreen.createDocument({
      justification: 'MetaMask Snaps Execution Environment',
      reasons: ['IFRAME_SCRIPTING' as chrome.offscreen.Reason],
      url: this.documentUrl.toString(),
    });
  }
}
