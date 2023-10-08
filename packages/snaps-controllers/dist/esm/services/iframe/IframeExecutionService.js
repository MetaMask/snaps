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
import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { createWindow } from '@metamask/snaps-utils';
import { AbstractExecutionService } from '../AbstractExecutionService';
export class IframeExecutionService extends AbstractExecutionService {
    terminateJob(jobWrapper) {
        document.getElementById(jobWrapper.id)?.remove();
    }
    async initEnvStream(jobId) {
        const iframeWindow = await createWindow(this.iframeUrl.toString(), jobId);
        const stream = new WindowPostMessageStream({
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