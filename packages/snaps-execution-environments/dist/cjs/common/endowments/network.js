"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _utils = require("../utils");
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
var _teardownRef = /*#__PURE__*/ new WeakMap(), _ogResponse = /*#__PURE__*/ new WeakMap();
/**
 * This class wraps a Response object.
 * That way, a teardown process can stop any processes left.
 */ class ResponseWrapper {
    get body() {
        return _class_private_field_get(this, _ogResponse).body;
    }
    get bodyUsed() {
        return _class_private_field_get(this, _ogResponse).bodyUsed;
    }
    get headers() {
        return _class_private_field_get(this, _ogResponse).headers;
    }
    get ok() {
        return _class_private_field_get(this, _ogResponse).ok;
    }
    get redirected() {
        return _class_private_field_get(this, _ogResponse).redirected;
    }
    get status() {
        return _class_private_field_get(this, _ogResponse).status;
    }
    get statusText() {
        return _class_private_field_get(this, _ogResponse).statusText;
    }
    get type() {
        return _class_private_field_get(this, _ogResponse).type;
    }
    get url() {
        return _class_private_field_get(this, _ogResponse).url;
    }
    async text() {
        return (0, _utils.withTeardown)(_class_private_field_get(this, _ogResponse).text(), this);
    }
    async arrayBuffer() {
        return (0, _utils.withTeardown)(_class_private_field_get(this, _ogResponse).arrayBuffer(), this);
    }
    async blob() {
        return (0, _utils.withTeardown)(_class_private_field_get(this, _ogResponse).blob(), this);
    }
    clone() {
        const newResponse = _class_private_field_get(this, _ogResponse).clone();
        return new ResponseWrapper(newResponse, _class_private_field_get(this, _teardownRef));
    }
    async formData() {
        return (0, _utils.withTeardown)(_class_private_field_get(this, _ogResponse).formData(), this);
    }
    async json() {
        return (0, _utils.withTeardown)(_class_private_field_get(this, _ogResponse).json(), this);
    }
    constructor(ogResponse, teardownRef){
        _class_private_field_init(this, _teardownRef, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _ogResponse, {
            writable: true,
            value: void 0
        });
        _class_private_field_set(this, _ogResponse, ogResponse);
        _class_private_field_set(this, _teardownRef, teardownRef);
    }
}
/**
 * Create a network endowment, consisting of a `fetch` function.
 * This allows us to provide a teardown function, so that we can cancel
 * any pending requests, connections, streams, etc. that may be open when a snap
 * is terminated.
 *
 * This wraps the original implementation of `fetch`,
 * to ensure that a bad actor cannot get access to the original function, thus
 * potentially preventing the network requests from being torn down.
 *
 * @returns An object containing a wrapped `fetch`
 * function, as well as a teardown function.
 */ const createNetwork = ()=>{
    // Open fetch calls or open body streams
    const openConnections = new Set();
    // Track last teardown count
    const teardownRef = {
        lastTeardown: 0
    };
    // Remove items from openConnections after they were garbage collected
    const cleanup = new FinalizationRegistry(/* istanbul ignore next: can't test garbage collection without modifying node parameters */ (callback)=>callback());
    const _fetch = async (input, init)=>{
        const abortController = new AbortController();
        if (init?.signal !== null && init?.signal !== undefined) {
            const originalSignal = init.signal;
            // Merge abort controllers
            originalSignal.addEventListener('abort', ()=>{
                abortController.abort(originalSignal.reason);
            }, {
                once: true
            });
        }
        let res;
        let openFetchConnection;
        try {
            const fetchPromise = fetch(input, {
                ...init,
                signal: abortController.signal
            });
            openFetchConnection = {
                cancel: async ()=>{
                    abortController.abort();
                    try {
                        await fetchPromise;
                    } catch  {
                    /* do nothing */ }
                }
            };
            openConnections.add(openFetchConnection);
            res = new ResponseWrapper(await (0, _utils.withTeardown)(fetchPromise, teardownRef), teardownRef);
        } finally{
            if (openFetchConnection !== undefined) {
                openConnections.delete(openFetchConnection);
            }
        }
        if (res.body !== null) {
            const body = new WeakRef(res.body);
            const openBodyConnection = {
                cancel: /* istanbul ignore next: see it.todo('can be torn down during body read') test */ async ()=>{
                    try {
                        await body.deref()?.cancel();
                    } catch  {
                    /* do nothing */ }
                }
            };
            openConnections.add(openBodyConnection);
            cleanup.register(res.body, /* istanbul ignore next: can't test garbage collection without modifying node parameters */ ()=>openConnections.delete(openBodyConnection));
        }
        return harden(res);
    };
    const teardownFunction = async ()=>{
        teardownRef.lastTeardown += 1;
        const promises = [];
        openConnections.forEach(({ cancel })=>promises.push(cancel()));
        openConnections.clear();
        await Promise.all(promises);
    };
    return {
        fetch: harden(_fetch),
        // Request, Headers and Response are the endowments injected alongside fetch
        // only when 'endowment:network-access' permission is requested,
        // therefore these are hardened as part of fetch dependency injection within its factory.
        // These endowments are not (and should never be) available by default.
        Request: harden(Request),
        Headers: harden(Headers),
        Response: harden(Response),
        teardownFunction
    };
};
const endowmentModule = {
    names: [
        'fetch',
        'Request',
        'Headers',
        'Response'
    ],
    factory: createNetwork
};
const _default = endowmentModule;

//# sourceMappingURL=network.js.map