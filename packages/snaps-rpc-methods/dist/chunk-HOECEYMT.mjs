import {
  createGenericPermissionValidator
} from "./chunk-TT4DP2YW.mjs";

// src/endowments/keyring.ts
import { PermissionType, SubjectType } from "@metamask/permission-controller";
import { rpcErrors } from "@metamask/rpc-errors";
import { assertIsKeyringOrigins, SnapCaveatType } from "@metamask/snaps-utils";
import { assert, hasProperty, isPlainObject } from "@metamask/utils";
var permissionName = "endowment:keyring" /* Keyring */;
var specificationBuilder = (_builderOptions) => {
  return {
    permissionType: PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: [
      SnapCaveatType.KeyringOrigin,
      SnapCaveatType.MaxRequestTime
    ],
    endowmentGetter: (_getterOptions) => null,
    validator: createGenericPermissionValidator([
      { type: SnapCaveatType.KeyringOrigin },
      { type: SnapCaveatType.MaxRequestTime, optional: true }
    ]),
    subjectTypes: [SubjectType.Snap]
  };
};
var keyringEndowmentBuilder = Object.freeze({
  targetName: permissionName,
  specificationBuilder
});
function validateCaveatOrigins(caveat) {
  if (!hasProperty(caveat, "value") || !isPlainObject(caveat.value)) {
    throw rpcErrors.invalidParams({
      message: "Invalid keyring origins: Expected a plain object."
    });
  }
  const { value } = caveat;
  assertIsKeyringOrigins(value, rpcErrors.invalidParams);
}
function getKeyringCaveatMapper(value) {
  return {
    caveats: [
      {
        type: SnapCaveatType.KeyringOrigin,
        value
      }
    ]
  };
}
function getKeyringCaveatOrigins(permission) {
  assert(permission?.caveats);
  assert(permission.caveats.length === 1);
  assert(permission.caveats[0].type === SnapCaveatType.KeyringOrigin);
  const caveat = permission.caveats[0];
  return caveat.value;
}
var keyringCaveatSpecifications = {
  [SnapCaveatType.KeyringOrigin]: Object.freeze({
    type: SnapCaveatType.KeyringOrigin,
    validator: (caveat) => validateCaveatOrigins(caveat)
  })
};

export {
  keyringEndowmentBuilder,
  getKeyringCaveatMapper,
  getKeyringCaveatOrigins,
  keyringCaveatSpecifications
};
//# sourceMappingURL=chunk-HOECEYMT.mjs.map