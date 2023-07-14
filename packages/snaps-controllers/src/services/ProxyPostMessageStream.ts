import { BasePostMessageStream } from '@metamask/post-message-stream';
import type { JsonRpcRequest } from '@metamask/utils';

export type ProxyPostMessageStreamArgs = {
  stream: BasePostMessageStream;
  jobId: string;
  extra?: Record<string, unknown>;
};

export type ProxyPostMessage = {
  jobId: string;
  data: JsonRpcRequest;
  extra?: Record<string, unknown>;
};

/**
 * A post message stream that wraps messages in a job ID, before sending them
 * over the underlying stream.
 */
export class ProxyPostMessageStream extends BasePostMessageStream {
  readonly #stream: BasePostMessageStream;

  readonly #jobId: string;

  readonly #extra?: Record<string, unknown>;

  /**
   * Initializes a new `ProxyPostMessageStream` instance.
   *
   * @param args - The constructor arguments.
   * @param args.stream - The underlying stream to use for communication.
   * @param args.jobId - The ID of the job this stream is associated with.
   * @param args.extra - Extra data to include in the post message.
   */
  constructor({ stream, jobId, extra }: ProxyPostMessageStreamArgs) {
    super();

    this.#stream = stream;
    this.#jobId = jobId;
    this.#extra = extra;

    this.#stream.on('data', this.#onData.bind(this));
  }

  /**
   * Handle incoming data from the underlying stream. This checks that the job
   * ID matches the expected job ID, and pushes the data to the stream if so.
   *
   * @param data - The data to handle.
   */
  #onData(data: ProxyPostMessage) {
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
  _postMessage(data: ProxyPostMessage) {
    this.#stream.write({
      jobId: this.#jobId,
      data,
      extra: this.#extra,
    });
  }
}
