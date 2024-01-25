import type { PostMessageEvent } from '@metamask/post-message-stream';
import { BasePostMessageStream } from '@metamask/post-message-stream';
import { isValidStreamMessage } from '@metamask/post-message-stream/dist/utils';
import { base64ToBytes, bytesToString } from '@metamask/utils';

type ProxyMessageStreamArgs = {
  name: string;
  target: string;
  targetOrigin?: string;
  targetWindow?: Window;
};
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
      (event: MessageEvent<PostMessageEvent>) => this._onMessage(event as any),
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
      this.#targetOrigin,
    );
  }

  private _onMessage(event: PostMessageEvent): void {
    const rawMessage = event.data as string;
    const bytes = base64ToBytes(rawMessage);
    const message = JSON.parse(bytesToString(bytes));

    // Notice that we don't check targetWindow or targetOrigin here.
    // This doesn't seem possible to do in RN.
    // TODO: Review whether we are fine with this before using in production.
    if (!isValidStreamMessage(message) || message.target !== this.#name) {
      return;
    }

    this._onData(message.data);
  }

  _destroy() {
    window.removeEventListener(
      'message',
      (event: MessageEvent<PostMessageEvent>) => this._onMessage(event as any),
      false,
    );
  }
}
