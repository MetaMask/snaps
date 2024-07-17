"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkQMULJEYNjs = require('./chunk-QMULJEYN.js');

// src/endowments/signature-insight.ts
var _permissioncontroller = require('@metamask/permission-controller');
var _rpcerrors = require('@metamask/rpc-errors');
var _snapsutils = require('@metamask/snaps-utils');
var _utils = require('@metamask/utils');
var permissionName = "endowment:signature-insight" /* SignatureInsight */;
var specificationBuilder = (_builderOptions) => {
  return {
    permissionType: _permissioncontroller.PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: [_snapsutils.SnapCaveatType.SignatureOrigin],
    endowmentGetter: (_getterOptions) => null,
    validator: _chunkQMULJEYNjs.createGenericPermissionValidator.call(void 0, [
      { type: _snapsutils.SnapCaveatType.SignatureOrigin, optional: true },
      { type: _snapsutils.SnapCaveatType.MaxRequestTime, optional: true }
    ]),
    subjectTypes: [_permissioncontroller.SubjectType.Snap]
  };
};
var signatureInsightEndowmentBuilder = Object.freeze({
  targetName: permissionName,
  specificationBuilder
});
function validateCaveat(caveat) {
  if (!_utils.hasProperty.call(void 0, caveat, "value") || !_utils.isPlainObject.call(void 0, caveat)) {
    throw _rpcerrors.rpcErrors.invalidParams({
      message: "Expected a plain object."
    });
  }
  const { value } = caveat;
  _utils.assert.call(void 0, 
    typeof value === "boolean",
    'Expected caveat value to have type "boolean"'
  );
}
function getSignatureInsightCaveatMapper(value) {
  if (!value || !_utils.isObject.call(void 0, value) || _utils.isObject.call(void 0, value) && Object.keys(value).length === 0) {
    return { caveats: null };
  }
  return {
    caveats: [
      {
        type: _snapsutils.SnapCaveatType.SignatureOrigin,
        value: _utils.hasProperty.call(void 0, value, "allowSignatureOrigin") && value.allowSignatureOrigin
      }
    ]
  };
}
function getSignatureOriginCaveat(permission) {
  if (!permission?.caveats) {
    return null;
  }
  _utils.assert.call(void 0, permission.caveats.length === 1);
  _utils.assert.call(void 0, permission.caveats[0].type === _snapsutils.SnapCaveatType.SignatureOrigin);
  const caveat = permission.caveats[0];
  return caveat.value ?? null;
}
var signatureInsightCaveatSpecifications = {
  [_snapsutils.SnapCaveatType.SignatureOrigin]: Object.freeze({
    type: _snapsutils.SnapCaveatType.SignatureOrigin,
    validator: (caveat) => validateCaveat(caveat)
  })
};






exports.signatureInsightEndowmentBuilder = signatureInsightEndowmentBuilder; exports.getSignatureInsightCaveatMapper = getSignatureInsightCaveatMapper; exports.getSignatureOriginCaveat = getSignatureOriginCaveat; exports.signatureInsightCaveatSpecifications = signatureInsightCaveatSpecifications;
//# sourceMappingURL=chunk-YZMFLB67.js.map