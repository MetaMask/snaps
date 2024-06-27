"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkQMULJEYNjs = require('./chunk-QMULJEYN.js');

// src/endowments/rpc.ts
var _permissioncontroller = require('@metamask/permission-controller');
var _rpcerrors = require('@metamask/rpc-errors');
var _snapsutils = require('@metamask/snaps-utils');
var _utils = require('@metamask/utils');
var targetName = "endowment:rpc" /* Rpc */;
var specificationBuilder = (_builderOptions) => {
  return {
    permissionType: _permissioncontroller.PermissionType.Endowment,
    targetName,
    allowedCaveats: [_snapsutils.SnapCaveatType.RpcOrigin, _snapsutils.SnapCaveatType.MaxRequestTime],
    endowmentGetter: (_getterOptions) => null,
    validator: _chunkQMULJEYNjs.createGenericPermissionValidator.call(void 0, [
      { type: _snapsutils.SnapCaveatType.RpcOrigin },
      { type: _snapsutils.SnapCaveatType.MaxRequestTime, optional: true }
    ]),
    subjectTypes: [_permissioncontroller.SubjectType.Snap]
  };
};
var rpcEndowmentBuilder = Object.freeze({
  targetName,
  specificationBuilder
});
function validateCaveatOrigins(caveat) {
  if (!_utils.hasProperty.call(void 0, caveat, "value") || !_utils.isPlainObject.call(void 0, caveat.value)) {
    throw _rpcerrors.rpcErrors.invalidParams({
      message: "Invalid JSON-RPC origins: Expected a plain object."
    });
  }
  const { value } = caveat;
  _snapsutils.assertIsRpcOrigins.call(void 0, value, _rpcerrors.rpcErrors.invalidParams);
}
function getRpcCaveatMapper(value) {
  return {
    caveats: [
      {
        type: _snapsutils.SnapCaveatType.RpcOrigin,
        value
      }
    ]
  };
}
function getRpcCaveatOrigins(permission) {
  const caveats = permission?.caveats?.filter(
    (caveat2) => caveat2.type === _snapsutils.SnapCaveatType.RpcOrigin
  );
  _utils.assert.call(void 0, caveats);
  _utils.assert.call(void 0, caveats.length === 1);
  const caveat = caveats[0];
  return caveat.value;
}
var rpcCaveatSpecifications = {
  [_snapsutils.SnapCaveatType.RpcOrigin]: Object.freeze({
    type: _snapsutils.SnapCaveatType.RpcOrigin,
    validator: (caveat) => validateCaveatOrigins(caveat)
  })
};






exports.rpcEndowmentBuilder = rpcEndowmentBuilder; exports.getRpcCaveatMapper = getRpcCaveatMapper; exports.getRpcCaveatOrigins = getRpcCaveatOrigins; exports.rpcCaveatSpecifications = rpcCaveatSpecifications;
//# sourceMappingURL=chunk-YT2Q3W5C.js.map