"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkQMULJEYNjs = require('./chunk-QMULJEYN.js');

// src/endowments/transaction-insight.ts
var _permissioncontroller = require('@metamask/permission-controller');
var _rpcerrors = require('@metamask/rpc-errors');
var _snapsutils = require('@metamask/snaps-utils');
var _utils = require('@metamask/utils');
var permissionName = "endowment:transaction-insight" /* TransactionInsight */;
var specificationBuilder = (_builderOptions) => {
  return {
    permissionType: _permissioncontroller.PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: [
      _snapsutils.SnapCaveatType.TransactionOrigin,
      _snapsutils.SnapCaveatType.MaxRequestTime
    ],
    endowmentGetter: (_getterOptions) => null,
    validator: _chunkQMULJEYNjs.createGenericPermissionValidator.call(void 0, [
      { type: _snapsutils.SnapCaveatType.TransactionOrigin, optional: true },
      { type: _snapsutils.SnapCaveatType.MaxRequestTime, optional: true }
    ]),
    subjectTypes: [_permissioncontroller.SubjectType.Snap]
  };
};
var transactionInsightEndowmentBuilder = Object.freeze({
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
function getTransactionInsightCaveatMapper(value) {
  if (!value || !_utils.isObject.call(void 0, value) || _utils.isObject.call(void 0, value) && Object.keys(value).length === 0) {
    return { caveats: null };
  }
  return {
    caveats: [
      {
        type: _snapsutils.SnapCaveatType.TransactionOrigin,
        value: _utils.hasProperty.call(void 0, value, "allowTransactionOrigin") && value.allowTransactionOrigin
      }
    ]
  };
}
function getTransactionOriginCaveat(permission) {
  if (!permission?.caveats) {
    return null;
  }
  _utils.assert.call(void 0, permission.caveats.length === 1);
  _utils.assert.call(void 0, permission.caveats[0].type === _snapsutils.SnapCaveatType.TransactionOrigin);
  const caveat = permission.caveats[0];
  return caveat.value ?? null;
}
var transactionInsightCaveatSpecifications = {
  [_snapsutils.SnapCaveatType.TransactionOrigin]: Object.freeze({
    type: _snapsutils.SnapCaveatType.TransactionOrigin,
    validator: (caveat) => validateCaveat(caveat)
  })
};






exports.transactionInsightEndowmentBuilder = transactionInsightEndowmentBuilder; exports.getTransactionInsightCaveatMapper = getTransactionInsightCaveatMapper; exports.getTransactionOriginCaveat = getTransactionOriginCaveat; exports.transactionInsightCaveatSpecifications = transactionInsightCaveatSpecifications;
//# sourceMappingURL=chunk-3WKIKYUH.js.map