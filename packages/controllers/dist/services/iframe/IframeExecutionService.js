"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IframeExecutionService = void 0;
const post_message_stream_1 = require("@metamask/post-message-stream");
const AbstractExecutionService_1 = require("../AbstractExecutionService");
class IframeExecutionService extends AbstractExecutionService_1.AbstractExecutionService {
    constructor({ iframeUrl, messenger, setupSnapProvider, }) {
        super({
            messenger,
            setupSnapProvider,
        });
        this.iframeUrl = iframeUrl;
    }
    _terminate(jobWrapper) {
        var _a;
        (_a = document.getElementById(jobWrapper.id)) === null || _a === void 0 ? void 0 : _a.remove();
    }
    async _initEnvStream(jobId) {
        const iframeWindow = await this._createWindow(this.iframeUrl.toString(), jobId);
        const stream = new post_message_stream_1.WindowPostMessageStream({
            name: 'parent',
            target: 'child',
            targetWindow: iframeWindow,
            targetOrigin: '*',
        });
        return { worker: iframeWindow, stream };
    }
    /**
     * Creates the iframe to be used as the execution environment. This may run
     * forever if the iframe never loads, but the promise should be wrapped in
     * an initialization timeout in the SnapController.
     *
     * @param uri - The iframe URI.
     * @param jobId - The job id.
     * @returns A promise that resolves to the contentWindow of the iframe.
     */
    _createWindow(uri, jobId) {
        return new Promise((resolve, reject) => {
            const iframe = document.createElement('iframe');
            // The order of operations appears to matter for everything except this
            // attribute. We may as well set it here.
            iframe.setAttribute('id', jobId);
            // In the past, we've had problems that appear to be symptomatic of the
            // iframe firing the `load` event before its scripts are actually loaded,
            // which has prevented snaps from executing properly. Therefore, we set
            // the `src` attribute and append the iframe to the DOM before attaching
            // the `load` listener.
            //
            // `load` should only fire when "all dependent resources" have been
            // loaded, which includes scripts.
            //
            // MDN article for `load` event: https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
            // Re: `load` firing twice: https://stackoverflow.com/questions/10781880/dynamically-created-iframe-triggers-onload-event-twice/15880489#15880489
            iframe.setAttribute('src', uri);
            document.body.appendChild(iframe);
            iframe.addEventListener('load', () => {
                if (iframe.contentWindow) {
                    resolve(iframe.contentWindow);
                }
                else {
                    // We don't know of a case when this would happen, but better to fail
                    // fast if it does.
                    reject(new Error(`iframe.contentWindow not present on load for job "${jobId}".`));
                }
            });
            // We need to set the sandbox attribute after appending the iframe to the
            // DOM, otherwise errors in the iframe will not be propagated via `error`
            // and `unhandledrejection` events, and we cannot catch and handle them.
            // We wish we knew why this was the case.
            //
            // We set this property after adding the `load` listener because it
            // appears to work dependably. ¯\_(ツ)_/¯
            //
            // We apply this property as a principle of least authority (POLA)
            // measure.
            // Ref: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-sandbox
            iframe.setAttribute('sandbox', 'allow-scripts');
        });
    }
}
exports.IframeExecutionService = IframeExecutionService;
//# sourceMappingURL=IframeExecutionService.js.map