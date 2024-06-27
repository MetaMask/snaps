"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/endowments/cronjob.ts
var _permissioncontroller = require('@metamask/permission-controller');
var _rpcerrors = require('@metamask/rpc-errors');



var _snapsutils = require('@metamask/snaps-utils');
var _utils = require('@metamask/utils');
var permissionName = "endowment:cronjob" /* Cronjob */;
var specificationBuilder = (_builderOptions) => {
  return {
    permissionType: _permissioncontroller.PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: [_snapsutils.SnapCaveatType.SnapCronjob],
    endowmentGetter: (_getterOptions) => null,
    subjectTypes: [_permissioncontroller.SubjectType.Snap]
  };
};
var cronjobEndowmentBuilder = Object.freeze({
  targetName: permissionName,
  specificationBuilder
});
function getCronjobCaveatMapper(value) {
  return {
    caveats: [
      {
        type: _snapsutils.SnapCaveatType.SnapCronjob,
        value
      }
    ]
  };
}
function getCronjobCaveatJobs(permission) {
  if (!permission?.caveats) {
    return null;
  }
  _utils.assert.call(void 0, permission.caveats.length === 1);
  _utils.assert.call(void 0, permission.caveats[0].type === _snapsutils.SnapCaveatType.SnapCronjob);
  const caveat = permission.caveats[0];
  return caveat.value?.jobs ?? null;
}
function validateCronjobCaveat(caveat) {
  if (!_utils.hasProperty.call(void 0, caveat, "value") || !_utils.isPlainObject.call(void 0, caveat.value)) {
    throw _rpcerrors.rpcErrors.invalidParams({
      message: "Expected a plain object."
    });
  }
  const { value } = caveat;
  if (!_utils.hasProperty.call(void 0, value, "jobs") || !_utils.isPlainObject.call(void 0, value)) {
    throw _rpcerrors.rpcErrors.invalidParams({
      message: "Expected a plain object."
    });
  }
  if (!_snapsutils.isCronjobSpecificationArray.call(void 0, value.jobs)) {
    throw _rpcerrors.rpcErrors.invalidParams({
      message: "Expected a valid cronjob specification array."
    });
  }
}
var cronjobCaveatSpecifications = {
  [_snapsutils.SnapCaveatType.SnapCronjob]: Object.freeze({
    type: _snapsutils.SnapCaveatType.SnapCronjob,
    validator: (caveat) => validateCronjobCaveat(caveat)
  })
};







exports.cronjobEndowmentBuilder = cronjobEndowmentBuilder; exports.getCronjobCaveatMapper = getCronjobCaveatMapper; exports.getCronjobCaveatJobs = getCronjobCaveatJobs; exports.validateCronjobCaveat = validateCronjobCaveat; exports.cronjobCaveatSpecifications = cronjobCaveatSpecifications;
//# sourceMappingURL=chunk-7HVABE5R.js.map