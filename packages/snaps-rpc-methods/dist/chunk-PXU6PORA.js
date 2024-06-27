"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkQMULJEYNjs = require('./chunk-QMULJEYN.js');

// src/endowments/name-lookup.ts
var _permissioncontroller = require('@metamask/permission-controller');
var _rpcerrors = require('@metamask/rpc-errors');




var _snapsutils = require('@metamask/snaps-utils');






var _utils = require('@metamask/utils');
var permissionName = "endowment:name-lookup" /* NameLookup */;
var specificationBuilder = (_builderOptions) => {
  return {
    permissionType: _permissioncontroller.PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: [
      _snapsutils.SnapCaveatType.ChainIds,
      _snapsutils.SnapCaveatType.LookupMatchers,
      _snapsutils.SnapCaveatType.MaxRequestTime
    ],
    endowmentGetter: (_getterOptions) => null,
    validator: _chunkQMULJEYNjs.createGenericPermissionValidator.call(void 0, [
      { type: _snapsutils.SnapCaveatType.ChainIds, optional: true },
      { type: _snapsutils.SnapCaveatType.LookupMatchers, optional: true },
      { type: _snapsutils.SnapCaveatType.MaxRequestTime, optional: true }
    ]),
    subjectTypes: [_permissioncontroller.SubjectType.Snap]
  };
};
var nameLookupEndowmentBuilder = Object.freeze({
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
  switch (caveat.type) {
    case _snapsutils.SnapCaveatType.ChainIds:
      _utils.assertStruct.call(void 0, value, _snapsutils.ChainIdsStruct);
      break;
    case _snapsutils.SnapCaveatType.LookupMatchers:
      _utils.assertStruct.call(void 0, value, _snapsutils.LookupMatchersStruct);
      break;
    default:
      throw _rpcerrors.rpcErrors.invalidParams({
        message: 'Invalid caveat type, must be one of the following: "chainIds", "matchers".'
      });
  }
}
function getNameLookupCaveatMapper(value) {
  if (!value || !_utils.isObject.call(void 0, value) || Object.keys(value).length === 0) {
    return { caveats: null };
  }
  const caveats = [];
  if (value.chains) {
    caveats.push({
      type: _snapsutils.SnapCaveatType.ChainIds,
      value: value.chains
    });
  }
  if (value.matchers) {
    caveats.push({
      type: _snapsutils.SnapCaveatType.LookupMatchers,
      value: value.matchers
    });
  }
  _utils.assert.call(void 0, caveats.length > 0);
  return { caveats };
}
function getChainIdsCaveat(permission) {
  if (!permission?.caveats) {
    return null;
  }
  const caveat = permission.caveats.find(
    (permCaveat) => permCaveat.type === _snapsutils.SnapCaveatType.ChainIds
  );
  return caveat ? caveat.value : null;
}
function getLookupMatchersCaveat(permission) {
  if (!permission?.caveats) {
    return null;
  }
  const caveat = permission.caveats.find(
    (permCaveat) => permCaveat.type === _snapsutils.SnapCaveatType.LookupMatchers
  );
  return caveat ? caveat.value : null;
}
var nameLookupCaveatSpecifications = {
  [_snapsutils.SnapCaveatType.ChainIds]: Object.freeze({
    type: _snapsutils.SnapCaveatType.ChainIds,
    validator: (caveat) => validateCaveat(caveat)
  }),
  [_snapsutils.SnapCaveatType.LookupMatchers]: Object.freeze({
    type: _snapsutils.SnapCaveatType.LookupMatchers,
    validator: (caveat) => validateCaveat(caveat)
  })
};







exports.nameLookupEndowmentBuilder = nameLookupEndowmentBuilder; exports.getNameLookupCaveatMapper = getNameLookupCaveatMapper; exports.getChainIdsCaveat = getChainIdsCaveat; exports.getLookupMatchersCaveat = getLookupMatchersCaveat; exports.nameLookupCaveatSpecifications = nameLookupCaveatSpecifications;
//# sourceMappingURL=chunk-PXU6PORA.js.map