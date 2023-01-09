import { BasePostMessageStream } from '@metamask/post-message-stream';
import { JsonRpcRequest } from '@metamask/utils';

export type OffscreenPostMessageStreamArgs = {
  stream: BasePostMessageStream;
  jobId: string;
  frameUrl: string;
};

export type OffscreenPostMessage = {
  jobId: string;
  data: JsonRpcRequest;
};

/**
 * A post message stream that wraps messages in a job ID, before sending them
 * over the underlying stream.
 */
export class OffscreenPostMessageStream extends BasePostMessageStream {
  readonly #stream: BasePostMessageStream;

  readonly #jobId: string;

  readonly #frameUrl: string;

  /**
   * Initializes a new `OffscreenPostMessageStream` instance.
   *
   * @param args - The constructor arguments.
   * @param args.stream - The underlying stream to use for communication.
   * @param args.jobId - The ID of the job this stream is associated with.
   * @param args.frameUrl - The URL of the frame to load inside the offscreen
   * document.
   */
  constructor({ stream, jobId, frameUrl }: OffscreenPostMessageStreamArgs) {
    super();

    this.#stream = stream;
    this.#jobId = jobId;
    this.#frameUrl = frameUrl;

    this.#stream.on('data', this.#onData.bind(this));
  }

  /**
   * Handle incoming data from the underlying stream. This checks that the job
   * ID matches the expected job ID, and pushes the data to the stream if so.
   *
   * @param data - The data to handle.
   */
  #onData(data: OffscreenPostMessage) {
    if (data.jobId !== this.#jobId) {
      return;
    }

    this.push(data.data);
  }

  /**
   * Write data to the underlying stream. This wraps the data in an object with
   * the job ID.
   *
   * @param data - The data to write.
   */
  _postMessage(data: OffscreenPostMessage) {
    this.#stream.write({
      jobId: this.#jobId,
      // TODO: Rather than injecting the frame URL here, we should come up with
      // a better way to do this. The frame URL is needed to avoid hard coding
      // it in the offscreen execution environment.
      frameUrl: this.#frameUrl,
      data,
    });
  }
}
