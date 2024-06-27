import {
  createGenericPermissionValidator
} from "./chunk-TT4DP2YW.mjs";

// src/endowments/rpc.ts
import { PermissionType, SubjectType } from "@metamask/permission-controller";
import { rpcErrors } from "@metamask/rpc-errors";
import { assertIsRpcOrigins, SnapCaveatType } from "@metamask/snaps-utils";
import { hasProperty, isPlainObject, assert } from "@metamask/utils";
var targetName = "endowment:rpc" /* Rpc */;
var specificationBuilder = (_builderOptions) => {
  return {
    permissionType: PermissionType.Endowment,
    targetName,
    allowedCaveats: [SnapCaveatType.RpcOrigin, SnapCaveatType.MaxRequestTime],
    endowmentGetter: (_getterOptions) => null,
    validator: createGenericPermissionValidator([
      { type: SnapCaveatType.RpcOrigin },
      { type: SnapCaveatType.MaxRequestTime, optional: true }
    ]),
    subjectTypes: [SubjectType.Snap]
  };
};
var rpcEndowmentBuilder = Object.freeze({
  targetName,
  specificationBuilder
});
function validateCaveatOrigins(caveat) {
  if (!hasProperty(caveat, "value") || !isPlainObject(caveat.value)) {
    throw rpcErrors.invalidParams({
      message: "Invalid JSON-RPC origins: Expected a plain object."
    });
  }
  const { value } = caveat;
  assertIsRpcOrigins(value, rpcErrors.invalidParams);
}
function getRpcCaveatMapper(value) {
  return {
    caveats: [
      {
        type: SnapCaveatType.RpcOrigin,
        value
      }
    ]
  };
}
function getRpcCaveatOrigins(permission) {
  const caveats = permission?.caveats?.filter(
    (caveat2) => caveat2.type === SnapCaveatType.RpcOrigin
  );
  assert(caveats);
  assert(caveats.length === 1);
  const caveat = caveats[0];
  return caveat.value;
}
var rpcCaveatSpecifications = {
  [SnapCaveatType.RpcOrigin]: Object.freeze({
    type: SnapCaveatType.RpcOrigin,
    validator: (caveat) => validateCaveatOrigins(caveat)
  })
};

export {
  rpcEndowmentBuilder,
  getRpcCaveatMapper,
  getRpcCaveatOrigins,
  rpcCaveatSpecifications
};
//# sourceMappingURL=chunk-57BL7O2P.mjs.map