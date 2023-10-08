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
    RpcOriginsStruct: function() {
        return RpcOriginsStruct;
    },
    assertIsRpcOrigins: function() {
        return assertIsRpcOrigins;
    },
    KeyringOriginsStruct: function() {
        return KeyringOriginsStruct;
    },
    assertIsKeyringOrigins: function() {
        return assertIsKeyringOrigins;
    },
    isOriginAllowed: function() {
        return isOriginAllowed;
    },
    assertIsJsonRpcSuccess: function() {
        return assertIsJsonRpcSuccess;
    }
});
const _permissioncontroller = require("@metamask/permission-controller");
const _utils = require("@metamask/utils");
const _superstruct = require("superstruct");
const RpcOriginsStruct = (0, _superstruct.refine)((0, _superstruct.object)({
    dapps: (0, _superstruct.optional)((0, _superstruct.boolean)()),
    snaps: (0, _superstruct.optional)((0, _superstruct.boolean)()),
    allowedOrigins: (0, _superstruct.optional)((0, _superstruct.array)((0, _superstruct.string)()))
}), 'RPC origins', (value)=>{
    const hasOrigins = Boolean(value.snaps === true || value.dapps === true || value.allowedOrigins && value.allowedOrigins.length > 0);
    if (hasOrigins) {
        return true;
    }
    return 'Must specify at least one JSON-RPC origin.';
});
function assertIsRpcOrigins(value, // eslint-disable-next-line @typescript-eslint/naming-convention
ErrorWrapper) {
    (0, _utils.assertStruct)(value, RpcOriginsStruct, 'Invalid JSON-RPC origins', ErrorWrapper);
}
const KeyringOriginsStruct = (0, _superstruct.object)({
    allowedOrigins: (0, _superstruct.optional)((0, _superstruct.array)((0, _superstruct.string)()))
});
function assertIsKeyringOrigins(value, // eslint-disable-next-line @typescript-eslint/naming-convention
ErrorWrapper) {
    (0, _utils.assertStruct)(value, KeyringOriginsStruct, 'Invalid keyring origins', ErrorWrapper);
}
function isOriginAllowed(origins, subjectType, origin) {
    // The MetaMask client is always allowed.
    if (origin === 'metamask') {
        return true;
    }
    // If the origin is in the `allowedOrigins` list, it is allowed.
    if (origins.allowedOrigins?.includes(origin)) {
        return true;
    }
    // If the origin is a website and `dapps` is true, it is allowed.
    if (subjectType === _permissioncontroller.SubjectType.Website && origins.dapps) {
        return true;
    }
    // If the origin is a snap and `snaps` is true, it is allowed.
    return Boolean(subjectType === _permissioncontroller.SubjectType.Snap && origins.snaps);
}
function assertIsJsonRpcSuccess(value) {
    if (!(0, _utils.isJsonRpcSuccess)(value)) {
        if ((0, _utils.isJsonRpcFailure)(value)) {
            throw new Error(`JSON-RPC request failed: ${value.error.message}`);
        }
        throw new Error('Invalid JSON-RPC response.');
    }
}

//# sourceMappingURL=json-rpc.js.map