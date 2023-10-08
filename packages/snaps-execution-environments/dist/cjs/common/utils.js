"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    constructError: function() {
        return constructError;
    },
    withTeardown: function() {
        return withTeardown;
    },
    proxyStreamProvider: function() {
        return proxyStreamProvider;
    },
    BLOCKED_RPC_METHODS: function() {
        return BLOCKED_RPC_METHODS;
    },
    assertSnapOutboundRequest: function() {
        return assertSnapOutboundRequest;
    },
    assertEthereumOutboundRequest: function() {
        return assertEthereumOutboundRequest;
    },
    sanitizeRequestArguments: function() {
        return sanitizeRequestArguments;
    }
});
const _utils = require("@metamask/utils");
const _ethrpcerrors = require("eth-rpc-errors");
const _logging = require("../logging");
function constructError(originalError) {
    let _originalError;
    if (originalError instanceof Error) {
        _originalError = originalError;
    } else if (typeof originalError === 'string') {
        _originalError = new Error(originalError);
        // The stack is useless in this case.
        delete _originalError.stack;
    }
    return _originalError;
}
async function withTeardown(originalPromise, teardownRef) {
    const myTeardown = teardownRef.lastTeardown;
    return new Promise((resolve, reject)=>{
        originalPromise.then((value)=>{
            if (teardownRef.lastTeardown === myTeardown) {
                resolve(value);
            } else {
                (0, _logging.log)('Late promise received after Snap finished execution. Promise will be dropped.');
            }
        }).catch((reason)=>{
            if (teardownRef.lastTeardown === myTeardown) {
                reject(reason);
            } else {
                (0, _logging.log)('Late promise received after Snap finished execution. Promise will be dropped.');
            }
        });
    });
}
function proxyStreamProvider(provider, request) {
    // Proxy target is intentionally set to be an empty object, to ensure
    // that access to the prototype chain is not possible.
    const proxy = new Proxy({}, {
        has (_target, prop) {
            return typeof prop === 'string' && [
                'request',
                'on',
                'removeListener'
            ].includes(prop);
        },
        get (_target, prop) {
            if (prop === 'request') {
                return request;
            } else if ([
                'on',
                'removeListener'
            ].includes(prop)) {
                return provider[prop];
            }
            return undefined;
        }
    });
    return proxy;
}
const BLOCKED_RPC_METHODS = Object.freeze([
    'wallet_requestSnaps',
    'wallet_requestPermissions',
    // We disallow all of these confirmations for now, since the screens are not ready for Snaps.
    'eth_sendRawTransaction',
    'eth_sendTransaction',
    'eth_sign',
    'eth_signTypedData',
    'eth_signTypedData_v1',
    'eth_signTypedData_v3',
    'eth_signTypedData_v4',
    'eth_decrypt',
    'eth_getEncryptionPublicKey',
    'wallet_addEthereumChain',
    'wallet_switchEthereumChain',
    'wallet_watchAsset',
    'wallet_registerOnboarding',
    'wallet_scanQRCode'
]);
function assertSnapOutboundRequest(args) {
    // Disallow any non `wallet_` or `snap_` methods for separation of concerns.
    (0, _utils.assert)(String.prototype.startsWith.call(args.method, 'wallet_') || String.prototype.startsWith.call(args.method, 'snap_'), 'The global Snap API only allows RPC methods starting with `wallet_*` and `snap_*`.');
    (0, _utils.assert)(!BLOCKED_RPC_METHODS.includes(args.method), _ethrpcerrors.ethErrors.rpc.methodNotFound({
        data: {
            method: args.method
        }
    }));
    (0, _utils.assertStruct)(args, _utils.JsonStruct, 'Provided value is not JSON-RPC compatible');
}
function assertEthereumOutboundRequest(args) {
    // Disallow snaps methods for separation of concerns.
    (0, _utils.assert)(!String.prototype.startsWith.call(args.method, 'snap_'), _ethrpcerrors.ethErrors.rpc.methodNotFound({
        data: {
            method: args.method
        }
    }));
    (0, _utils.assert)(!BLOCKED_RPC_METHODS.includes(args.method), _ethrpcerrors.ethErrors.rpc.methodNotFound({
        data: {
            method: args.method
        }
    }));
    (0, _utils.assertStruct)(args, _utils.JsonStruct, 'Provided value is not JSON-RPC compatible');
}
function sanitizeRequestArguments(value) {
    // Before passing to getSafeJson we run the value through JSON serialization.
    // This lets request arguments contain undefined which is normally disallowed.
    const json = JSON.parse(JSON.stringify(value));
    return (0, _utils.getSafeJson)(json);
}

//# sourceMappingURL=utils.js.map