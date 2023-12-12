/* eslint-disable @typescript-eslint/unbound-method */
import type { PostMessageEvent } from '@metamask/post-message-stream';
import { BasePostMessageStream } from '@metamask/post-message-stream';
import { isValidStreamMessage } from '@metamask/post-message-stream/dist/utils';

type ProxyMessageStreamArgs = {
  name: string;
  target: string;
  targetOrigin?: string;
  targetWindow?: Window;
};

const getSource = Object.getOwnPropertyDescriptor(
  MessageEvent.prototype,
  'source',
)?.get;
assert(getSource, 'MessageEvent.prototype.source getter is not defined.');

/* istanbul ignore next */
const getOrigin = Object.getOwnPropertyDescriptor(
  MessageEvent.prototype,
  'origin',
)?.get;
assert(getOrigin, 'MessageEvent.prototype.origin getter is not defined.');

/**
 * A {@link Window.postMessage} stream.
 */

export class ProxyMessageStream extends BasePostMessageStream {
  #name;

  #target;

  #targetOrigin;

  #targetWindow;

  /**
   * Creates a stream for communicating with other streams across the same or
   * different `window` objects.
   *
   * @param args - Options bag.
   * @param args.name - The name of the stream. Used to differentiate between
   * multiple streams sharing the same window object.
   * @param args.target - The name of the stream to exchange messages with.
   * @param args.targetOrigin - The origin of the target. Defaults to
   * `location.origin`, '*' is permitted.
   * @param args.targetWindow - The window object of the target stream. Defaults
   * to `window`.
   */
  constructor({
    name,
    target,
    targetOrigin = window.location.origin,
    targetWindow = window,
  }: ProxyMessageStreamArgs) {
    super();

    if (
      typeof window === 'undefined' ||
      typeof window.postMessage !== 'function'
    ) {
      throw new Error(
        'window.postMessage is not a function. This class should only be instantiated in a Window.',
      );
    }

    this.#name = name;
    this.#target = target;
    this.#targetOrigin = targetOrigin;
    this.#targetWindow = targetWindow;
    this._onMessage = this._onMessage.bind(this);

    window.addEventListener(
      'message',
      this._onMessage as unknown as EventListener,
      false,
    );

    this._handshake();
  }

  /**
   * Webview needs to receive strings only on postMessage. That's the main difference between this and the original window post message stream.
   * Reference: https://github.com/react-native-webview/react-native-webview/blob/master/docs/Guide.md?plain=1#L471
   */

  protected _postMessage(data: unknown): void {
    this.#targetWindow.postMessage(
      JSON.stringify({
        target: this.#target,
        data,
      }),
    );
  }

  private _onMessage(event: PostMessageEvent): void {
    const message = event.data;

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    if (
      (this.#targetOrigin !== '*' &&
        getOrigin!.call(event) !== this.#targetOrigin) ||
      getSource!.call(event) !== this.#targetWindow ||
      !isValidStreamMessage(message) ||
      message.target !== this.#name
    ) {
      return;
    }

    this._onData(message.data);
  }

  _destroy() {
    window.removeEventListener('message', this._onMessage as any, false);
  }
}
