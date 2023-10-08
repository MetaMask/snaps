"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "OffscreenSnapExecutor", {
    enumerable: true,
    get: function() {
        return OffscreenSnapExecutor;
    }
});
const _postmessagestream = require("@metamask/post-message-stream");
const _snapsutils = require("@metamask/snaps-utils");
const _utils = require("@metamask/utils");
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
function _class_private_method_get(receiver, privateSet, fn) {
    if (!privateSet.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return fn;
}
function _class_private_method_init(obj, privateSet) {
    _check_private_redeclaration(obj, privateSet);
    privateSet.add(obj);
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
var _stream = /*#__PURE__*/ new WeakMap(), /**
   * Handle an incoming message from the `OffscreenExecutionService`. This
   * assumes that the message contains a `jobId` property, and a JSON-RPC
   * request in the `data` property.
   *
   * @param data - The message data.
   * @param data.data - The JSON-RPC request.
   * @param data.jobId - The job ID.
   * @param data.extra - Extra data.
   * @param data.extra.frameUrl - The URL to load in the iframe.
   */ _onData = /*#__PURE__*/ new WeakSet(), _initializeJob = /*#__PURE__*/ new WeakSet(), /**
   * Terminate the job with the given ID. This will close the iframe and delete
   * the job from the internal job map.
   *
   * @param jobId - The job ID.
   */ _terminateJob = /*#__PURE__*/ new WeakSet();
class OffscreenSnapExecutor {
    /**
   * Initialize the executor with the given stream. This is a wrapper around the
   * constructor.
   *
   * @param stream - The stream to use for communication.
   * @returns The initialized executor.
   */ static initialize(stream) {
        return new OffscreenSnapExecutor(stream);
    }
    constructor(stream){
        _class_private_method_init(this, _onData);
        /**
   * Create a new iframe and set up a stream to communicate with it.
   *
   * @param jobId - The job ID.
   * @param frameUrl - The URL to load in the iframe.
   */ _class_private_method_init(this, _initializeJob);
        _class_private_method_init(this, _terminateJob);
        _class_private_field_init(this, _stream, {
            writable: true,
            value: void 0
        });
        _define_property(this, "jobs", {});
        _class_private_field_set(this, _stream, stream);
        _class_private_field_get(this, _stream).on('data', _class_private_method_get(this, _onData, onData).bind(this));
    }
}
function onData(data) {
    const { jobId, extra: { frameUrl }, data: request } = data;
    if (!this.jobs[jobId]) {
        // This ensures that a job is initialized before it is used. To avoid
        // code duplication, we call the `#onData` method again, which will
        // run the rest of the logic after initialization.
        _class_private_method_get(this, _initializeJob, initializeJob).call(this, jobId, frameUrl).then(()=>{
            _class_private_method_get(this, _onData, onData).call(this, data);
        }).catch((error)=>{
            (0, _snapsutils.logError)('[Worker] Error initializing job:', error);
        });
        return;
    }
    // This is a method specific to the `OffscreenSnapExecutor`, as the service
    // itself does not have access to the iframes directly.
    if (request.method === 'terminateJob') {
        _class_private_method_get(this, _terminateJob, terminateJob).call(this, jobId);
        return;
    }
    this.jobs[jobId].stream.write(request);
}
async function initializeJob(jobId, frameUrl) {
    const window = await (0, _snapsutils.createWindow)(frameUrl, jobId);
    const jobStream = new _postmessagestream.WindowPostMessageStream({
        name: 'parent',
        target: 'child',
        targetWindow: window,
        targetOrigin: '*'
    });
    // Write messages from the iframe to the parent, wrapped with the job ID.
    jobStream.on('data', (data)=>{
        _class_private_field_get(this, _stream).write({
            data,
            jobId
        });
    });
    this.jobs[jobId] = {
        id: jobId,
        window,
        stream: jobStream
    };
    return this.jobs[jobId];
}
function terminateJob(jobId) {
    (0, _utils.assert)(this.jobs[jobId], `Job "${jobId}" not found.`);
    const iframe = document.getElementById(jobId);
    (0, _utils.assert)(iframe, `Iframe with ID "${jobId}" not found.`);
    iframe.remove();
    this.jobs[jobId].stream.destroy();
    delete this.jobs[jobId];
}

//# sourceMappingURL=OffscreenSnapExecutor.js.map