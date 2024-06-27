import {
  WebViewMessageStream
} from "./chunk-IGC4E7PI.mjs";
import {
  ProxyExecutionService
} from "./chunk-6PDHWCA7.mjs";
import {
  __privateAdd,
  __privateGet,
  __privateMethod,
  __privateSet
} from "./chunk-YRZVIDCF.mjs";

// src/services/webview/WebViewExecutionService.ts
var _getWebView, _ensureWebViewLoaded, ensureWebViewLoaded_fn;
var WebViewExecutionService = class extends ProxyExecutionService {
  constructor({
    messenger,
    setupSnapProvider,
    getWebView
  }) {
    super({
      messenger,
      setupSnapProvider,
      stream: new WebViewMessageStream({
        name: "parent",
        target: "child",
        getWebView
      })
    });
    /**
     * Ensure that the WebView has been loaded by awaiting the getWebView promise.
     */
    __privateAdd(this, _ensureWebViewLoaded);
    __privateAdd(this, _getWebView, void 0);
    __privateSet(this, _getWebView, getWebView);
  }
  /**
   * Create a new stream for the specified job. This wraps the runtime stream
   * in a stream specific to the job.
   *
   * @param jobId - The job ID.
   */
  async initEnvStream(jobId) {
    await __privateMethod(this, _ensureWebViewLoaded, ensureWebViewLoaded_fn).call(this);
    return super.initEnvStream(jobId);
  }
};
_getWebView = new WeakMap();
_ensureWebViewLoaded = new WeakSet();
ensureWebViewLoaded_fn = async function() {
  await __privateGet(this, _getWebView).call(this);
};

export {
  WebViewExecutionService
};
//# sourceMappingURL=chunk-2JRUBMYF.mjs.map