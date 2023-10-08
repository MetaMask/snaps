function _check_private_redeclaration(obj, privateCollection) {
    if (privateCollection.has(obj)) {
        throw new TypeError("Cannot initialize the same private elements twice on an object");
    }
}
function _class_apply_descriptor_get(receiver, descriptor) {
    if (descriptor.get) {
        return descriptor.get.call(receiver);
    }
    return descriptor.value;
}
function _class_apply_descriptor_set(receiver, descriptor, value) {
    if (descriptor.set) {
        descriptor.set.call(receiver, value);
    } else {
        if (!descriptor.writable) {
            throw new TypeError("attempted to set read only private field");
        }
        descriptor.value = value;
    }
}
function _class_extract_field_descriptor(receiver, privateMap, action) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to " + action + " private field on non-instance");
    }
    return privateMap.get(receiver);
}
function _class_private_field_get(receiver, privateMap) {
    var descriptor = _class_extract_field_descriptor(receiver, privateMap, "get");
    return _class_apply_descriptor_get(receiver, descriptor);
}
function _class_private_field_init(obj, privateMap, value) {
    _check_private_redeclaration(obj, privateMap);
    privateMap.set(obj, value);
}
function _class_private_field_set(receiver, privateMap, value) {
    var descriptor = _class_extract_field_descriptor(receiver, privateMap, "set");
    _class_apply_descriptor_set(receiver, descriptor, value);
    return value;
}
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
import { BrowserRuntimePostMessageStream } from '@metamask/post-message-stream';
import { nanoid } from 'nanoid';
import { AbstractExecutionService } from '../AbstractExecutionService';
import { ProxyPostMessageStream } from '../ProxyPostMessageStream';
var _runtimeStream = /*#__PURE__*/ new WeakMap();
export class OffscreenExecutionService extends AbstractExecutionService {
    /**
   * Send a termination command to the offscreen document.
   *
   * @param job - The job to terminate.
   */ async terminateJob(job) {
        // The `AbstractExecutionService` will have already closed the job stream,
        // so we write to the runtime stream directly.
        _class_private_field_get(this, _runtimeStream).write({
            jobId: job.id,
            data: {
                jsonrpc: '2.0',
                method: 'terminateJob',
                id: nanoid()
            }
        });
    }
    /**
   * Create a new stream for the specified job. This wraps the runtime stream
   * in a stream specific to the job.
   *
   * @param jobId - The job ID.
   */ async initEnvStream(jobId) {
        // Lazily create the offscreen document.
        await this.createDocument();
        const stream = new ProxyPostMessageStream({
            stream: _class_private_field_get(this, _runtimeStream),
            extra: {
                // TODO: Rather than injecting the frame URL here, we should come up
                // with a better way to do this. The frame URL is needed to avoid hard
                // coding it in the offscreen execution environment.
                frameUrl: this.frameUrl.toString()
            },
            jobId
        });
        return {
            worker: jobId,
            stream
        };
    }
    /**
   * Creates the offscreen document to be used as the execution environment.
   *
   * If the document already exists, this does nothing.
   */ async createDocument() {
        // Extensions can only have a single offscreen document.
        if (await chrome.offscreen.hasDocument()) {
            return;
        }
        await chrome.offscreen.createDocument({
            justification: 'MetaMask Snaps Execution Environment',
            reasons: [
                'IFRAME_SCRIPTING'
            ],
            url: this.documentUrl.toString()
        });
    }
    /**
   * Create a new offscreen execution service.
   *
   * @param args - The constructor arguments.
   * @param args.documentUrl - The URL of the offscreen document to use as the
   * execution environment. This must be a URL relative to the location where
   * this is called. This cannot be a public (http(s)) URL.
   * @param args.frameUrl - The URL of the iframe to load inside the offscreen
   * document.
   * @param args.messenger - The messenger to use for communication with the
   * `SnapController`.
   * @param args.setupSnapProvider - The function to use to set up the snap
   * provider.
   */ constructor({ documentUrl, frameUrl, messenger, setupSnapProvider }){
        super({
            messenger,
            setupSnapProvider
        });
        _define_property(this, "documentUrl", void 0);
        _define_property(this, "frameUrl", void 0);
        _class_private_field_init(this, _runtimeStream, {
            writable: true,
            value: void 0
        });
        this.documentUrl = documentUrl;
        this.frameUrl = frameUrl;
        _class_private_field_set(this, _runtimeStream, new BrowserRuntimePostMessageStream({
            name: 'parent',
            target: 'child'
        }));
    }
}

//# sourceMappingURL=OffscreenExecutionService.js.map