import type { PostMessageEvent } from '@metamask/post-message-stream';
import {
  BasePostMessageStream,
  isValidStreamMessage,
} from '@metamask/post-message-stream';
import { assert, stringToBytes } from '@metamask/utils';

export type WebViewInterface = {
  injectJavaScript(js: string): void;
  registerMessageListener(listener: (event: PostMessageEvent) => void): void;
  unregisterMessageListener(listener: (event: PostMessageEvent) => void): void;
};

export type WebViewStreamArgs = {
  name: string;
  target: string;
  webView: WebViewInterface;
};

/**
 * A special postMessage stream used to interface with a WebView.
 */
export class WebViewMessageStream extends BasePostMessageStream {
  readonly #name;

  readonly #target;

  readonly #webView: WebViewInterface | undefined;

  /**
   * Creates a stream for communicating with other streams inside a WebView.
   *
   * @param args - Options bag.
   * @param args.name - The name of the stream. Used to differentiate between
   * multiple streams sharing the same window object.
   * @param args.target - The name of the stream to exchange messages with.
   * @param args.webView - A reference to the WebView.
   */
  constructor({ name, target, webView }: WebViewStreamArgs) {
    super();

    this.#name = name;
    this.#target = target;

    this._onMessage = this._onMessage.bind(this);

    this.#webView = webView;
    // This method is already bound.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.#webView.registerMessageListener(this._onMessage);
    this._handshake();
  }

  protected _postMessage(data: unknown): void {
    assert(this.#webView);
    const json = JSON.stringify({
      target: this.#target,
      data,
    });

    // To prevent XSS, we encode the message before injecting it.
    // This adds significant performance overhead for larger messages.
    const bytes = new Uint8Array(stringToBytes(json));

    this.#webView.injectJavaScript(`window.postMessage([${bytes.toString()}])`);
  }

  // TODO: Either fix this lint violation or explain why it's necessary to
  //  ignore.
  // eslint-disable-next-line no-restricted-syntax
  private _onMessage(event: PostMessageEvent): void {
    if (typeof event.data !== 'string') {
      return;
    }

    const message = JSON.parse(event.data);

    // Notice that we don't check targetWindow or targetOrigin here.
    // This doesn't seem possible to do in RN.
    if (!isValidStreamMessage(message) || message.target !== this.#name) {
      return;
    }

    this._onData(message.data);
  }

  _destroy() {
    assert(this.#webView);
    // This method is already bound.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    this.#webView.unregisterMessageListener(this._onMessage);
  }
}
