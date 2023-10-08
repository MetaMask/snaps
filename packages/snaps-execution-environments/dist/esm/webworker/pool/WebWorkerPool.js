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
import { WebWorkerParentPostMessageStream, WindowPostMessageStream } from '@metamask/post-message-stream';
import { logError } from '@metamask/snaps-utils';
import { assert } from '@metamask/utils';
import { nanoid } from 'nanoid/non-secure';
var _poolSize = /*#__PURE__*/ new WeakMap(), _stream = /*#__PURE__*/ new WeakMap(), _url = /*#__PURE__*/ new WeakMap(), _workerSourceURL = /*#__PURE__*/ new WeakMap(), /**
   * Handle an incoming message from the `WebWorkerExecutionService`. This
   * assumes that the message contains a `jobId` property, and a JSON-RPC
   * request in the `data` property.
   *
   * @param data - The message data.
   * @param data.data - The JSON-RPC request.
   * @param data.jobId - The job ID.
   */ _onData = /*#__PURE__*/ new WeakSet(), _initializeJob = /*#__PURE__*/ new WeakSet(), /**
   * Terminate the job with the given ID. This will close the worker and delete
   * the job from the internal job map.
   *
   * @param jobId - The job ID.
   */ _terminateJob = /*#__PURE__*/ new WeakSet(), _getWorker = /*#__PURE__*/ new WeakSet(), _updatePool = /*#__PURE__*/ new WeakSet(), _createWorker = /*#__PURE__*/ new WeakSet(), _getWorkerURL = /*#__PURE__*/ new WeakSet();
/**
 * A snap executor using the WebWorker API.
 *
 * This is not a traditional snap executor, as it does not execute snaps itself.
 * Instead, it creates a pool of webworkers for each snap execution, and sends
 * the snap execution request to the webworker. The webworker is responsible for
 * executing the snap.
 */ export class WebWorkerPool {
    /* istanbul ignore next - Constructor arguments. */ static initialize(stream = new WindowPostMessageStream({
        name: 'child',
        target: 'parent',
        targetWindow: self.parent,
        targetOrigin: '*'
    }), url = '../executor/bundle.js', poolSize) {
        return new WebWorkerPool(stream, url, poolSize);
    }
    constructor(stream, url, poolSize = 3){
        _class_private_method_init(this, _onData);
        /**
   * Create a new worker and set up a stream to communicate with it.
   *
   * @param jobId - The job ID.
   * @returns The job.
   */ _class_private_method_init(this, _initializeJob);
        _class_private_method_init(this, _terminateJob);
        /**
   * Get a worker from the pool. A new worker will be created automatically.
   *
   * @returns The worker.
   */ _class_private_method_init(this, _getWorker);
        /**
   * Update the pool of workers. This will create new workers if the pool is
   * below the minimum size.
   */ _class_private_method_init(this, _updatePool);
        /**
   * Create a new worker. This will fetch the worker source if it has not
   * already been fetched.
   *
   * @returns The worker.
   */ _class_private_method_init(this, _createWorker);
        /**
   * Get the URL of the worker source. This will fetch the worker source if it
   * has not already been fetched.
   *
   * @returns The worker source URL, as a `blob:` URL.
   */ _class_private_method_init(this, _getWorkerURL);
        _class_private_field_init(this, _poolSize, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _stream, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _url, {
            writable: true,
            value: void 0
        });
        _define_property(this, "pool", []);
        _define_property(this, "jobs", new Map());
        _class_private_field_init(this, _workerSourceURL, {
            writable: true,
            value: void 0
        });
        _class_private_field_set(this, _stream, stream);
        _class_private_field_set(this, _url, url);
        _class_private_field_set(this, _poolSize, poolSize);
        _class_private_field_get(this, _stream).on('data', _class_private_method_get(this, _onData, onData).bind(this));
    }
}
function onData(data) {
    const { jobId, data: request } = data;
    const job = this.jobs.get(jobId);
    if (!job) {
        // This ensures that a job is initialized before it is used. To avoid
        // code duplication, we call the `#onData` method again, which will
        // run the rest of the logic after initialization.
        _class_private_method_get(this, _initializeJob, initializeJob).call(this, jobId).then(()=>{
            _class_private_method_get(this, _onData, onData).call(this, data);
        }).catch((error)=>{
            logError('[Worker] Error initializing job:', error.toString());
            _class_private_field_get(this, _stream).write({
                jobId,
                data: {
                    name: 'command',
                    data: {
                        jsonrpc: '2.0',
                        id: request.id ?? null,
                        error: {
                            code: -32000,
                            message: 'Internal error'
                        }
                    }
                }
            });
        });
        return;
    }
    // This is a method specific to the `WebWorkerPool`, as the service itself
    // does not have access to the workers directly.
    if (request.method === 'terminateJob') {
        _class_private_method_get(this, _terminateJob, terminateJob).call(this, jobId);
        return;
    }
    job.stream.write(request);
}
async function initializeJob(jobId) {
    const worker = await _class_private_method_get(this, _getWorker, getWorker).call(this);
    const jobStream = new WebWorkerParentPostMessageStream({
        worker
    });
    // Write messages from the worker to the parent, wrapped with the job ID.
    jobStream.on('data', (data)=>{
        _class_private_field_get(this, _stream).write({
            data,
            jobId
        });
    });
    const job = {
        id: jobId,
        worker,
        stream: jobStream
    };
    this.jobs.set(jobId, job);
    return job;
}
function terminateJob(jobId) {
    const job = this.jobs.get(jobId);
    assert(job, `Job "${jobId}" not found.`);
    job.stream.destroy();
    job.worker.terminate();
    this.jobs.delete(jobId);
}
async function getWorker() {
    // Lazily create the pool of workers.
    if (this.pool.length === 0) {
        await _class_private_method_get(this, _updatePool, updatePool).call(this);
    }
    const worker = this.pool.shift();
    assert(worker, 'Worker not found.');
    await _class_private_method_get(this, _updatePool, updatePool).call(this);
    return worker;
}
async function updatePool() {
    while(this.pool.length < _class_private_field_get(this, _poolSize)){
        const worker = await _class_private_method_get(this, _createWorker, createWorker).call(this);
        this.pool.push(worker);
    }
}
async function createWorker() {
    return new Worker(await _class_private_method_get(this, _getWorkerURL, getWorkerURL).call(this), {
        name: `worker-${nanoid()}`
    });
}
async function getWorkerURL() {
    if (_class_private_field_get(this, _workerSourceURL)) {
        return _class_private_field_get(this, _workerSourceURL);
    }
    const blob = await fetch(_class_private_field_get(this, _url)).then(async (response)=>response.blob()).then(URL.createObjectURL.bind(URL));
    _class_private_field_set(this, _workerSourceURL, blob);
    return blob;
}

//# sourceMappingURL=WebWorkerPool.js.map