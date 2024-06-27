"use strict";Object.defineProperty(exports, "__esModule", {value: true});



var _chunkEXN2TFDJjs = require('./chunk-EXN2TFDJ.js');

// src/services/webview/WebViewMessageStream.ts
var _postmessagestream = require('@metamask/post-message-stream');
var _utils = require('@metamask/post-message-stream/dist/utils');
var _snapsutils = require('@metamask/snaps-utils');
var _utils3 = require('@metamask/utils');
var _name, _target, _webView;
var WebViewMessageStream = class extends _postmessagestream.BasePostMessageStream {
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
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _name, void 0);
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _target, void 0);
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _webView, void 0);
    _chunkEXN2TFDJjs.__privateSet.call(void 0, this, _name, name);
    _chunkEXN2TFDJjs.__privateSet.call(void 0, this, _target, target);
    this._onMessage = this._onMessage.bind(this);
    getWebView().then((webView) => {
      _chunkEXN2TFDJjs.__privateSet.call(void 0, this, _webView, webView);
      webView.registerMessageListener(this._onMessage);
      this._handshake();
    }).catch((error) => {
      _snapsutils.logError.call(void 0, error);
    });
  }
  _postMessage(data) {
    _utils3.assert.call(void 0, _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _webView));
    const json = JSON.stringify({
      target: _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _target),
      data
    });
    const bytes = _utils3.stringToBytes.call(void 0, json);
    const base64 = _utils3.bytesToBase64.call(void 0, bytes);
    _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _webView).injectJavaScript(`window.postMessage('${base64}')`);
  }
  _onMessage(event) {
    if (typeof event.data !== "string") {
      return;
    }
    const message = JSON.parse(event.data);
    if (!_utils.isValidStreamMessage.call(void 0, message) || message.target !== _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _name)) {
      return;
    }
    this._onData(message.data);
  }
  _destroy() {
    _utils3.assert.call(void 0, _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _webView));
    _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _webView).unregisterMessageListener(this._onMessage);
  }
};
_name = new WeakMap();
_target = new WeakMap();
_webView = new WeakMap();



exports.WebViewMessageStream = WebViewMessageStream;
//# sourceMappingURL=chunk-C4D6GBMY.js.map