import { BasePostMessageStream } from '@metamask/post-message-stream';
import {
  isJsonRpcNotification,
  isJsonRpcRequest,
  isJsonRpcResponse,
  isPlainObject,
} from '@metamask/utils';

const noOp = () => undefined;

type MockProxyMessageStreamArgs = {
  name: string;
  target: string;
  targetOrigin?: string;
  targetWindow?: Window;
  write?: () => void;
};

export class MockPostMessageStream extends BasePostMessageStream {
  readonly #write: (...args: unknown[]) => unknown;

  constructor(write: () => void = noOp) {
    super();

    this.#write = write;
  }

  protected _postMessage(data: unknown): void {
    this.#write(data);

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

export class MockProxyMessageStream extends BasePostMessageStream {
  #name;

  #target;

  #targetOrigin;

  #targetWindow;

  #write: (...args: unknown[]) => unknown;

  constructor({
    name,
    target,
    targetOrigin = window.location.origin,
    targetWindow = window,
    write = noOp,
  }: MockProxyMessageStreamArgs) {
    super();

    this.#name = name;
    this.#target = target;
    this.#targetOrigin = targetOrigin;
    this.#targetWindow = targetWindow;
    this.#write = write;
  }

  protected _postMessage(data: unknown): void {
    this.#write(data);

    if (isPlainObject(data) && isJsonRpcResponse(data.data)) {
      this.emit('response', data.data);
      return;
    }

    if (isPlainObject(data) && isJsonRpcNotification(data.data)) {
      this.emit('notification', data.data);
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
