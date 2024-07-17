import {
  createGenericPermissionValidator
} from "./chunk-TT4DP2YW.mjs";

// src/endowments/name-lookup.ts
import { PermissionType, SubjectType } from "@metamask/permission-controller";
import { rpcErrors } from "@metamask/rpc-errors";
import {
  ChainIdsStruct,
  LookupMatchersStruct,
  SnapCaveatType
} from "@metamask/snaps-utils";
import {
  assert,
  assertStruct,
  hasProperty,
  isObject,
  isPlainObject
} from "@metamask/utils";
var permissionName = "endowment:name-lookup" /* NameLookup */;
var specificationBuilder = (_builderOptions) => {
  return {
    permissionType: PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: [
      SnapCaveatType.ChainIds,
      SnapCaveatType.LookupMatchers,
      SnapCaveatType.MaxRequestTime
    ],
    endowmentGetter: (_getterOptions) => null,
    validator: createGenericPermissionValidator([
      { type: SnapCaveatType.ChainIds, optional: true },
      { type: SnapCaveatType.LookupMatchers, optional: true },
      { type: SnapCaveatType.MaxRequestTime, optional: true }
    ]),
    subjectTypes: [SubjectType.Snap]
  };
};
var nameLookupEndowmentBuilder = Object.freeze({
  targetName: permissionName,
  specificationBuilder
});
function validateCaveat(caveat) {
  if (!hasProperty(caveat, "value") || !isPlainObject(caveat)) {
    throw rpcErrors.invalidParams({
      message: "Expected a plain object."
    });
  }
  const { value } = caveat;
  switch (caveat.type) {
    case SnapCaveatType.ChainIds:
      assertStruct(value, ChainIdsStruct);
      break;
    case SnapCaveatType.LookupMatchers:
      assertStruct(value, LookupMatchersStruct);
      break;
    default:
      throw rpcErrors.invalidParams({
        message: 'Invalid caveat type, must be one of the following: "chainIds", "matchers".'
      });
  }
}
function getNameLookupCaveatMapper(value) {
  if (!value || !isObject(value) || Object.keys(value).length === 0) {
    return { caveats: null };
  }
  const caveats = [];
  if (value.chains) {
    caveats.push({
      type: SnapCaveatType.ChainIds,
      value: value.chains
    });
  }
  if (value.matchers) {
    caveats.push({
      type: SnapCaveatType.LookupMatchers,
      value: value.matchers
    });
  }
  assert(caveats.length > 0);
  return { caveats };
}
function getChainIdsCaveat(permission) {
  if (!permission?.caveats) {
    return null;
  }
  const caveat = permission.caveats.find(
    (permCaveat) => permCaveat.type === SnapCaveatType.ChainIds
  );
  return caveat ? caveat.value : null;
}
function getLookupMatchersCaveat(permission) {
  if (!permission?.caveats) {
    return null;
  }
  const caveat = permission.caveats.find(
    (permCaveat) => permCaveat.type === SnapCaveatType.LookupMatchers
  );
  return caveat ? caveat.value : null;
}
var nameLookupCaveatSpecifications = {
  [SnapCaveatType.ChainIds]: Object.freeze({
    type: SnapCaveatType.ChainIds,
    validator: (caveat) => validateCaveat(caveat)
  }),
  [SnapCaveatType.LookupMatchers]: Object.freeze({
    type: SnapCaveatType.LookupMatchers,
    validator: (caveat) => validateCaveat(caveat)
  })
};

export {
  nameLookupEndowmentBuilder,
  getNameLookupCaveatMapper,
  getChainIdsCaveat,
  getLookupMatchersCaveat,
  nameLookupCaveatSpecifications
};
//# sourceMappingURL=chunk-ODN35VOK.mjs.map