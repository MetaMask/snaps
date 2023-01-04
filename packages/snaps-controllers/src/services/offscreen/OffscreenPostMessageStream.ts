import { BrowserRuntimePostMessageStream } from '@metamask/post-message-stream';
import { JsonRpcParams, JsonRpcRequest } from '@metamask/utils';

export type OffscreenPostMessageStreamArgs = {
  name: string;
  target: string;
  jobId: string;
  frameUrl: string;
};

export type OffscreenPostMessage = {
  jobId: string;
  data: JsonRpcRequest<JsonRpcParams>;
};

/**
 * A post message stream that wraps messages in a job ID, before sending them
 * over the underlying stream.
 */
export class OffscreenPostMessageStream extends BrowserRuntimePostMessageStream {
  readonly #jobId: string;

  readonly #frameUrl: string;

  /**
   * Initializes a new `OffscreenDuplexStream` instance.
   *
   * @param args - The constructor arguments.
   * @param args.name - The name of the stream.
   * @param args.target - The name of the target stream.
   * @param args.jobId - The ID of the job this stream is associated with.
   * @param args.frameUrl - The URL of the frame to load inside the offscreen
   * document.
   */
  constructor({
    name,
    target,
    jobId,
    frameUrl,
  }: OffscreenPostMessageStreamArgs) {
    super({ name, target });

    this.#jobId = jobId;
    this.#frameUrl = frameUrl;
  }

  /**
   * Handle incoming data from the underlying stream. This checks that the job
   * ID matches the expected job ID, and pushes the data to the stream if so.
   *
   * @param data - The data to handle.
   */
  protected _onData(data: OffscreenPostMessage) {
    if (data.jobId !== this.#jobId) {
      return;
    }

    super._onData(data.data);
  }

  /**
   * Write data to the underlying stream. This wraps the data in an object with
   * the job ID.
   *
   * @param data - The data to write.
   */
  protected _postMessage(data: OffscreenPostMessage) {
    super._postMessage({
      jobId: this.#jobId,
      // TODO: Rather than injecting the frame URL here, we should come up with
      // a better way to do this. The frame URL is needed to avoid hard coding
      // it in the offscreen execution environment.
      frameUrl: this.#frameUrl,
      data,
    });
  }
}
