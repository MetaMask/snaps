"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "IframeExecutionService", {
    enumerable: true,
    get: function() {
        return IframeExecutionService;
    }
});
const _postmessagestream = require("@metamask/post-message-stream");
const _snapsutils = require("@metamask/snaps-utils");
const _AbstractExecutionService = require("../AbstractExecutionService");
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
class IframeExecutionService extends _AbstractExecutionService.AbstractExecutionService {
    terminateJob(jobWrapper) {
        document.getElementById(jobWrapper.id)?.remove();
    }
    async initEnvStream(jobId) {
        const iframeWindow = await (0, _snapsutils.createWindow)(this.iframeUrl.toString(), jobId);
        const stream = new _postmessagestream.WindowPostMessageStream({
            name: 'parent',
            target: 'child',
            targetWindow: iframeWindow,
            targetOrigin: '*'
        });
        return {
            worker: iframeWindow,
            stream
        };
    }
    constructor({ iframeUrl, messenger, setupSnapProvider }){
        super({
            messenger,
            setupSnapProvider
        });
        _define_property(this, "iframeUrl", void 0);
        this.iframeUrl = iframeUrl;
    }
}

//# sourceMappingURL=IframeExecutionService.js.map