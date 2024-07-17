import {
  createGenericPermissionValidator
} from "./chunk-TT4DP2YW.mjs";

// src/endowments/signature-insight.ts
import { PermissionType, SubjectType } from "@metamask/permission-controller";
import { rpcErrors } from "@metamask/rpc-errors";
import { SnapCaveatType } from "@metamask/snaps-utils";
import { assert, hasProperty, isObject, isPlainObject } from "@metamask/utils";
var permissionName = "endowment:signature-insight" /* SignatureInsight */;
var specificationBuilder = (_builderOptions) => {
  return {
    permissionType: PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: [SnapCaveatType.SignatureOrigin],
    endowmentGetter: (_getterOptions) => null,
    validator: createGenericPermissionValidator([
      { type: SnapCaveatType.SignatureOrigin, optional: true },
      { type: SnapCaveatType.MaxRequestTime, optional: true }
    ]),
    subjectTypes: [SubjectType.Snap]
  };
};
var signatureInsightEndowmentBuilder = Object.freeze({
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
  assert(
    typeof value === "boolean",
    'Expected caveat value to have type "boolean"'
  );
}
function getSignatureInsightCaveatMapper(value) {
  if (!value || !isObject(value) || isObject(value) && Object.keys(value).length === 0) {
    return { caveats: null };
  }
  return {
    caveats: [
      {
        type: SnapCaveatType.SignatureOrigin,
        value: hasProperty(value, "allowSignatureOrigin") && value.allowSignatureOrigin
      }
    ]
  };
}
function getSignatureOriginCaveat(permission) {
  if (!permission?.caveats) {
    return null;
  }
  assert(permission.caveats.length === 1);
  assert(permission.caveats[0].type === SnapCaveatType.SignatureOrigin);
  const caveat = permission.caveats[0];
  return caveat.value ?? null;
}
var signatureInsightCaveatSpecifications = {
  [SnapCaveatType.SignatureOrigin]: Object.freeze({
    type: SnapCaveatType.SignatureOrigin,
    validator: (caveat) => validateCaveat(caveat)
  })
};

export {
  signatureInsightEndowmentBuilder,
  getSignatureInsightCaveatMapper,
  getSignatureOriginCaveat,
  signatureInsightCaveatSpecifications
};
//# sourceMappingURL=chunk-33LLA2MH.mjs.map