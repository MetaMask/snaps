// src/endowments/cronjob.ts
import { PermissionType, SubjectType } from "@metamask/permission-controller";
import { rpcErrors } from "@metamask/rpc-errors";
import {
  SnapCaveatType,
  isCronjobSpecificationArray
} from "@metamask/snaps-utils";
import { assert, hasProperty, isPlainObject } from "@metamask/utils";
var permissionName = "endowment:cronjob" /* Cronjob */;
var specificationBuilder = (_builderOptions) => {
  return {
    permissionType: PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: [SnapCaveatType.SnapCronjob],
    endowmentGetter: (_getterOptions) => null,
    subjectTypes: [SubjectType.Snap]
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
        type: SnapCaveatType.SnapCronjob,
        value
      }
    ]
  };
}
function getCronjobCaveatJobs(permission) {
  if (!permission?.caveats) {
    return null;
  }
  assert(permission.caveats.length === 1);
  assert(permission.caveats[0].type === SnapCaveatType.SnapCronjob);
  const caveat = permission.caveats[0];
  return caveat.value?.jobs ?? null;
}
function validateCronjobCaveat(caveat) {
  if (!hasProperty(caveat, "value") || !isPlainObject(caveat.value)) {
    throw rpcErrors.invalidParams({
      message: "Expected a plain object."
    });
  }
  const { value } = caveat;
  if (!hasProperty(value, "jobs") || !isPlainObject(value)) {
    throw rpcErrors.invalidParams({
      message: "Expected a plain object."
    });
  }
  if (!isCronjobSpecificationArray(value.jobs)) {
    throw rpcErrors.invalidParams({
      message: "Expected a valid cronjob specification array."
    });
  }
}
var cronjobCaveatSpecifications = {
  [SnapCaveatType.SnapCronjob]: Object.freeze({
    type: SnapCaveatType.SnapCronjob,
    validator: (caveat) => validateCronjobCaveat(caveat)
  })
};

export {
  cronjobEndowmentBuilder,
  getCronjobCaveatMapper,
  getCronjobCaveatJobs,
  validateCronjobCaveat,
  cronjobCaveatSpecifications
};
//# sourceMappingURL=chunk-3WCLDJAS.mjs.map