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
import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { createWindow } from '@metamask/snaps-utils';
import { assert } from '@metamask/utils';
import { nanoid } from 'nanoid';
import { AbstractExecutionService } from '../AbstractExecutionService';
import { ProxyPostMessageStream } from '../ProxyPostMessageStream';
export const WORKER_POOL_ID = 'snaps-worker-pool';
var _documentUrl = /*#__PURE__*/ new WeakMap(), _runtimeStream = /*#__PURE__*/ new WeakMap();
export class WebWorkerExecutionService extends AbstractExecutionService {
    /**
   * Send a termination command to the worker pool document.
   *
   * @param job - The job to terminate.
   */ async terminateJob(job) {
        // The `AbstractExecutionService` will have already closed the job stream,
        // so we write to the runtime stream directly.
        assert(_class_private_field_get(this, _runtimeStream), 'Runtime stream not initialized.');
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
        // Lazily create the worker pool document.
        await this.createDocument();
        // `createDocument` should have initialized the runtime stream.
        assert(_class_private_field_get(this, _runtimeStream), 'Runtime stream not initialized.');
        const stream = new ProxyPostMessageStream({
            stream: _class_private_field_get(this, _runtimeStream),
            jobId
        });
        return {
            worker: jobId,
            stream
        };
    }
    /**
   * Creates the worker pool document to be used as the execution environment.
   *
   * If the document already exists, this does nothing.
   */ async createDocument() {
        // We only want to create a single pool.
        if (document.getElementById(WORKER_POOL_ID)) {
            return;
        }
        const window = await createWindow(_class_private_field_get(this, _documentUrl).href, WORKER_POOL_ID, false);
        _class_private_field_set(this, _runtimeStream, new WindowPostMessageStream({
            name: 'parent',
            target: 'child',
            targetWindow: window,
            targetOrigin: '*'
        }));
    }
    /**
   * Create a new webworker execution service.
   *
   * @param args - The constructor arguments.
   * @param args.documentUrl - The URL of the worker pool document to use as the
   * execution environment.
   * @param args.messenger - The messenger to use for communication with the
   * `SnapController`.
   * @param args.setupSnapProvider - The function to use to set up the snap
   * provider.
   */ constructor({ documentUrl, messenger, setupSnapProvider }){
        super({
            messenger,
            setupSnapProvider
        });
        _class_private_field_init(this, _documentUrl, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _runtimeStream, {
            writable: true,
            value: void 0
        });
        _class_private_field_set(this, _documentUrl, documentUrl);
    }
}

//# sourceMappingURL=WebWorkerExecutionService.js.map