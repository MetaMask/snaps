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
import { BasePostMessageStream } from '@metamask/post-message-stream';
var _stream = /*#__PURE__*/ new WeakMap(), _jobId = /*#__PURE__*/ new WeakMap(), _extra = /*#__PURE__*/ new WeakMap(), /**
   * Handle incoming data from the underlying stream. This checks that the job
   * ID matches the expected job ID, and pushes the data to the stream if so.
   *
   * @param data - The data to handle.
   */ _onData = /*#__PURE__*/ new WeakSet();
/**
 * A post message stream that wraps messages in a job ID, before sending them
 * over the underlying stream.
 */ export class ProxyPostMessageStream extends BasePostMessageStream {
    /**
   * Write data to the underlying stream. This wraps the data in an object with
   * the job ID.
   *
   * @param data - The data to write.
   */ _postMessage(data) {
        _class_private_field_get(this, _stream).write({
            jobId: _class_private_field_get(this, _jobId),
            data,
            extra: _class_private_field_get(this, _extra)
        });
    }
    /**
   * Initializes a new `ProxyPostMessageStream` instance.
   *
   * @param args - The constructor arguments.
   * @param args.stream - The underlying stream to use for communication.
   * @param args.jobId - The ID of the job this stream is associated with.
   * @param args.extra - Extra data to include in the post message.
   */ constructor({ stream, jobId, extra }){
        super();
        _class_private_method_init(this, _onData);
        _class_private_field_init(this, _stream, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _jobId, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _extra, {
            writable: true,
            value: void 0
        });
        _class_private_field_set(this, _stream, stream);
        _class_private_field_set(this, _jobId, jobId);
        _class_private_field_set(this, _extra, extra);
        _class_private_field_get(this, _stream).on('data', _class_private_method_get(this, _onData, onData).bind(this));
    }
}
function onData(data) {
    if (data.jobId !== _class_private_field_get(this, _jobId)) {
        return;
    }
    this.push(data.data);
}

//# sourceMappingURL=ProxyPostMessageStream.js.map