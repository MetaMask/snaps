"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkQMULJEYNjs = require('./chunk-QMULJEYN.js');

// src/endowments/keyring.ts
var _permissioncontroller = require('@metamask/permission-controller');
var _rpcerrors = require('@metamask/rpc-errors');
var _snapsutils = require('@metamask/snaps-utils');
var _utils = require('@metamask/utils');
var permissionName = "endowment:keyring" /* Keyring */;
var specificationBuilder = (_builderOptions) => {
  return {
    permissionType: _permissioncontroller.PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: [
      _snapsutils.SnapCaveatType.KeyringOrigin,
      _snapsutils.SnapCaveatType.MaxRequestTime
    ],
    endowmentGetter: (_getterOptions) => null,
    validator: _chunkQMULJEYNjs.createGenericPermissionValidator.call(void 0, [
      { type: _snapsutils.SnapCaveatType.KeyringOrigin },
      { type: _snapsutils.SnapCaveatType.MaxRequestTime, optional: true }
    ]),
    subjectTypes: [_permissioncontroller.SubjectType.Snap]
  };
};
var keyringEndowmentBuilder = Object.freeze({
  targetName: permissionName,
  specificationBuilder
});
function validateCaveatOrigins(caveat) {
  if (!_utils.hasProperty.call(void 0, caveat, "value") || !_utils.isPlainObject.call(void 0, caveat.value)) {
    throw _rpcerrors.rpcErrors.invalidParams({
      message: "Invalid keyring origins: Expected a plain object."
    });
  }
  const { value } = caveat;
  _snapsutils.assertIsKeyringOrigins.call(void 0, value, _rpcerrors.rpcErrors.invalidParams);
}
function getKeyringCaveatMapper(value) {
  return {
    caveats: [
      {
        type: _snapsutils.SnapCaveatType.KeyringOrigin,
        value
      }
    ]
  };
}
function getKeyringCaveatOrigins(permission) {
  _utils.assert.call(void 0, permission?.caveats);
  _utils.assert.call(void 0, permission.caveats.length === 1);
  _utils.assert.call(void 0, permission.caveats[0].type === _snapsutils.SnapCaveatType.KeyringOrigin);
  const caveat = permission.caveats[0];
  return caveat.value;
}
var keyringCaveatSpecifications = {
  [_snapsutils.SnapCaveatType.KeyringOrigin]: Object.freeze({
    type: _snapsutils.SnapCaveatType.KeyringOrigin,
    validator: (caveat) => validateCaveatOrigins(caveat)
  })
};






exports.keyringEndowmentBuilder = keyringEndowmentBuilder; exports.getKeyringCaveatMapper = getKeyringCaveatMapper; exports.getKeyringCaveatOrigins = getKeyringCaveatOrigins; exports.keyringCaveatSpecifications = keyringCaveatSpecifications;
//# sourceMappingURL=chunk-T56DKVFS.js.map