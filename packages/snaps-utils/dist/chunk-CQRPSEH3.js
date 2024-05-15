"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/json-rpc.ts
var _permissioncontroller = require('@metamask/permission-controller');




var _utils = require('@metamask/utils');
var _superstruct = require('superstruct');
var RpcOriginsStruct = _superstruct.refine.call(void 0, 
  _superstruct.object.call(void 0, {
    dapps: _superstruct.optional.call(void 0, _superstruct.boolean.call(void 0, )),
    snaps: _superstruct.optional.call(void 0, _superstruct.boolean.call(void 0, )),
    allowedOrigins: _superstruct.optional.call(void 0, _superstruct.array.call(void 0, _superstruct.string.call(void 0, )))
  }),
  "RPC origins",
  (value) => {
    const hasOrigins = Boolean(
      value.snaps === true || value.dapps === true || value.allowedOrigins && value.allowedOrigins.length > 0
    );
    if (hasOrigins) {
      return true;
    }
    return "Must specify at least one JSON-RPC origin.";
  }
);
function assertIsRpcOrigins(value, ErrorWrapper) {
  _utils.assertStruct.call(void 0, 
    value,
    RpcOriginsStruct,
    "Invalid JSON-RPC origins",
    ErrorWrapper
  );
}
var KeyringOriginsStruct = _superstruct.object.call(void 0, {
  allowedOrigins: _superstruct.optional.call(void 0, _superstruct.array.call(void 0, _superstruct.string.call(void 0, )))
});
function assertIsKeyringOrigins(value, ErrorWrapper) {
  _utils.assertStruct.call(void 0, 
    value,
    KeyringOriginsStruct,
    "Invalid keyring origins",
    ErrorWrapper
  );
}
function isOriginAllowed(origins, subjectType, origin) {
  if (origin === "metamask") {
    return true;
  }
  if (origins.allowedOrigins?.includes(origin)) {
    return true;
  }
  if (subjectType === _permissioncontroller.SubjectType.Website && origins.dapps) {
    return true;
  }
  return Boolean(subjectType === _permissioncontroller.SubjectType.Snap && origins.snaps);
}
function assertIsJsonRpcSuccess(value) {
  if (!_utils.isJsonRpcSuccess.call(void 0, value)) {
    if (_utils.isJsonRpcFailure.call(void 0, value)) {
      throw new Error(`JSON-RPC request failed: ${value.error.message}`);
    }
    throw new Error("Invalid JSON-RPC response.");
  }
}








exports.RpcOriginsStruct = RpcOriginsStruct; exports.assertIsRpcOrigins = assertIsRpcOrigins; exports.KeyringOriginsStruct = KeyringOriginsStruct; exports.assertIsKeyringOrigins = assertIsKeyringOrigins; exports.isOriginAllowed = isOriginAllowed; exports.assertIsJsonRpcSuccess = assertIsJsonRpcSuccess;
//# sourceMappingURL=chunk-CQRPSEH3.js.map