"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkC4D6GBMYjs = require('./chunk-C4D6GBMY.js');


var _chunkNV2VSGCRjs = require('./chunk-NV2VSGCR.js');





var _chunkEXN2TFDJjs = require('./chunk-EXN2TFDJ.js');

// src/services/webview/WebViewExecutionService.ts
var _getWebView, _ensureWebViewLoaded, ensureWebViewLoaded_fn;
var WebViewExecutionService = class extends _chunkNV2VSGCRjs.ProxyExecutionService {
  constructor({
    messenger,
    setupSnapProvider,
    getWebView
  }) {
    super({
      messenger,
      setupSnapProvider,
      stream: new (0, _chunkC4D6GBMYjs.WebViewMessageStream)({
        name: "parent",
        target: "child",
        getWebView
      })
    });
    /**
     * Ensure that the WebView has been loaded by awaiting the getWebView promise.
     */
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _ensureWebViewLoaded);
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _getWebView, void 0);
    _chunkEXN2TFDJjs.__privateSet.call(void 0, this, _getWebView, getWebView);
  }
  /**
   * Create a new stream for the specified job. This wraps the runtime stream
   * in a stream specific to the job.
   *
   * @param jobId - The job ID.
   */
  async initEnvStream(jobId) {
    await _chunkEXN2TFDJjs.__privateMethod.call(void 0, this, _ensureWebViewLoaded, ensureWebViewLoaded_fn).call(this);
    return super.initEnvStream(jobId);
  }
};
_getWebView = new WeakMap();
_ensureWebViewLoaded = new WeakSet();
ensureWebViewLoaded_fn = async function() {
  await _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _getWebView).call(this);
};



exports.WebViewExecutionService = WebViewExecutionService;
//# sourceMappingURL=chunk-6NBIPSYU.js.map