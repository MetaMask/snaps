import {
  __privateAdd,
  __privateGet,
  __privateSet
} from "./chunk-YRZVIDCF.mjs";

// src/services/webview/WebViewMessageStream.ts
import { BasePostMessageStream } from "@metamask/post-message-stream";
import { isValidStreamMessage } from "@metamask/post-message-stream/dist/utils";
import { logError } from "@metamask/snaps-utils";
import { assert, bytesToBase64, stringToBytes } from "@metamask/utils";
var _name, _target, _webView;
var WebViewMessageStream = class extends BasePostMessageStream {
  /**
   * Creates a stream for communicating with other streams inside a WebView.
   *
   * @param args - Options bag.
   * @param args.name - The name of the stream. Used to differentiate between
   * multiple streams sharing the same window object.
   * @param args.target - The name of the stream to exchange messages with.
   * @param args.getWebView - A asynchronous getter for the webview.
   */
  constructor({ name, target, getWebView }) {
    super();
    __privateAdd(this, _name, void 0);
    __privateAdd(this, _target, void 0);
    __privateAdd(this, _webView, void 0);
    __privateSet(this, _name, name);
    __privateSet(this, _target, target);
    this._onMessage = this._onMessage.bind(this);
    getWebView().then((webView) => {
      __privateSet(this, _webView, webView);
      webView.registerMessageListener(this._onMessage);
      this._handshake();
    }).catch((error) => {
      logError(error);
    });
  }
  _postMessage(data) {
    assert(__privateGet(this, _webView));
    const json = JSON.stringify({
      target: __privateGet(this, _target),
      data
    });
    const bytes = stringToBytes(json);
    const base64 = bytesToBase64(bytes);
    __privateGet(this, _webView).injectJavaScript(`window.postMessage('${base64}')`);
  }
  _onMessage(event) {
    if (typeof event.data !== "string") {
      return;
    }
    const message = JSON.parse(event.data);
    if (!isValidStreamMessage(message) || message.target !== __privateGet(this, _name)) {
      return;
    }
    this._onData(message.data);
  }
  _destroy() {
    assert(__privateGet(this, _webView));
    __privateGet(this, _webView).unregisterMessageListener(this._onMessage);
  }
};
_name = new WeakMap();
_target = new WeakMap();
_webView = new WeakMap();

export {
  WebViewMessageStream
};
//# sourceMappingURL=chunk-IGC4E7PI.mjs.map