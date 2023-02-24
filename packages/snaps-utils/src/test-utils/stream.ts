import { BasePostMessageStream } from '@metamask/post-message-stream';
import {
  isJsonRpcRequest,
  isJsonRpcResponse,
  isPlainObject,
} from '@metamask/utils';

const noOp = () => undefined;

export class MockPostMessageStream extends BasePostMessageStream {
  readonly #write: (...args: unknown[]) => unknown;

  constructor(write: () => void = noOp) {
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

export class MockWindowPostMessageStream extends BasePostMessageStream {
  readonly #write: (...args: unknown[]) => unknown;

  constructor(write: () => void = noOp) {
    super();

    this.#write = write;
  }

  protected _postMessage(data: unknown): void {
    this.#write(data);

    // Responses shouldn't be written back to the stream, as it would create a
    // cycle. Instead, we emit them as an arbitrary `response` event.
    if (isPlainObject(data) && isJsonRpcResponse(data.data)) {
      this.emit('response', data.data);
      return;
    }

    if (
      isPlainObject(data) &&
      isPlainObject(data.data) &&
      data.data.name === 'metamask-provider' &&
      isJsonRpcRequest(data.data.data)
    ) {
      this.emit('outbound', data.data);
      return;
    }

    this.emit('data', data);
  }
}
