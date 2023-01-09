import { BasePostMessageStream } from '@metamask/post-message-stream';
import { isJsonRpcResponse, isPlainObject } from '@metamask/utils';

export class MockPostMessageStream extends BasePostMessageStream {
  readonly #write: (...args: unknown[]) => unknown;

  constructor(write: () => void = jest.fn()) {
    super();

    this.#write = write;
  }

  protected _postMessage(data: unknown): void {
    this.#write(data);

    // Responses shouldn't be written back to the stream, as it would create a
    // cycle. Instead, we emit them as an arbitrary `response` event.
    if (
      isPlainObject(data) &&
      isPlainObject(data.data) &&
      isJsonRpcResponse(data.data.data)
    ) {
      this.emit('response', data.data.data);
      return;
    }

    this.emit('data', data);
  }
}
