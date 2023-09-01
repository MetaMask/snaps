import { BrowserRuntimePostMessageStream } from '@metamask/post-message-stream';
import { nanoid } from 'nanoid';

import type { ExecutionServiceArgs, Job } from '../AbstractExecutionService';
import { AbstractExecutionService } from '../AbstractExecutionService';
import { ProxyPostMessageStream } from '../ProxyPostMessageStream';

type OffscreenExecutionEnvironmentServiceArgs = {
  documentUrl: URL;
  frameUrl: URL;
} & ExecutionServiceArgs;

export class OffscreenExecutionService extends AbstractExecutionService<string> {
  public readonly documentUrl: URL;

  public readonly frameUrl: URL;

  readonly #runtimeStream: BrowserRuntimePostMessageStream;

  /**
   * Create a new offscreen execution service.
   *
   * @param args - The constructor arguments.
   * @param args.documentUrl - The URL of the offscreen document to use as the
   * execution environment. This must be a URL relative to the location where
   * this is called. This cannot be a public (http(s)) URL.
   * @param args.frameUrl - The URL of the iframe to load inside the offscreen
   * document.
   * @param args.messenger - The messenger to use for communication with the
   * `SnapController`.
   * @param args.setupSnapProvider - The function to use to set up the snap
   * provider.
   */
  constructor({
    documentUrl,
    frameUrl,
    messenger,
    setupSnapProvider,
  }: OffscreenExecutionEnvironmentServiceArgs) {
    super({
      messenger,
      setupSnapProvider,
    });

    this.documentUrl = documentUrl;
    this.frameUrl = frameUrl;
    this.#runtimeStream = new BrowserRuntimePostMessageStream({
      name: 'parent',
      target: 'child',
    });
  }

  /**
   * Send a termination command to the offscreen document.
   *
   * @param job - The job to terminate.
   */
  protected async terminateJob(job: Job<string>) {
    // The `AbstractExecutionService` will have already closed the job stream,
    // so we write to the runtime stream directly.
    this.#runtimeStream.write({
      jobId: job.id,
      data: {
        jsonrpc: '2.0',
        method: 'terminateJob',
        id: nanoid(),
      },
    });
  }

  /**
   * Create a new stream for the specified job. This wraps the runtime stream
   * in a stream specific to the job.
   *
   * @param jobId - The job ID.
   */
  protected async initEnvStream(jobId: string) {
    // Lazily create the offscreen document.
    await this.createDocument();

    const stream = new ProxyPostMessageStream({
      stream: this.#runtimeStream,
      extra: {
        // TODO: Rather than injecting the frame URL here, we should come up
        // with a better way to do this. The frame URL is needed to avoid hard
        // coding it in the offscreen execution environment.
        frameUrl: this.frameUrl.toString(),
      },
      jobId,
    });

    return { worker: jobId, stream };
  }

  /**
   * Creates the offscreen document to be used as the execution environment.
   *
   * If the document already exists, this does nothing.
   */
  private async createDocument() {
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
