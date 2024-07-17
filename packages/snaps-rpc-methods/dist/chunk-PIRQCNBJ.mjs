import {
  createGenericPermissionValidator
} from "./chunk-TT4DP2YW.mjs";

// src/endowments/transaction-insight.ts
import { PermissionType, SubjectType } from "@metamask/permission-controller";
import { rpcErrors } from "@metamask/rpc-errors";
import { SnapCaveatType } from "@metamask/snaps-utils";
import { assert, hasProperty, isObject, isPlainObject } from "@metamask/utils";
var permissionName = "endowment:transaction-insight" /* TransactionInsight */;
var specificationBuilder = (_builderOptions) => {
  return {
    permissionType: PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: [
      SnapCaveatType.TransactionOrigin,
      SnapCaveatType.MaxRequestTime
    ],
    endowmentGetter: (_getterOptions) => null,
    validator: createGenericPermissionValidator([
      { type: SnapCaveatType.TransactionOrigin, optional: true },
      { type: SnapCaveatType.MaxRequestTime, optional: true }
    ]),
    subjectTypes: [SubjectType.Snap]
  };
};
var transactionInsightEndowmentBuilder = Object.freeze({
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
function getTransactionInsightCaveatMapper(value) {
  if (!value || !isObject(value) || isObject(value) && Object.keys(value).length === 0) {
    return { caveats: null };
  }
  return {
    caveats: [
      {
        type: SnapCaveatType.TransactionOrigin,
        value: hasProperty(value, "allowTransactionOrigin") && value.allowTransactionOrigin
      }
    ]
  };
}
function getTransactionOriginCaveat(permission) {
  if (!permission?.caveats) {
    return null;
  }
  assert(permission.caveats.length === 1);
  assert(permission.caveats[0].type === SnapCaveatType.TransactionOrigin);
  const caveat = permission.caveats[0];
  return caveat.value ?? null;
}
var transactionInsightCaveatSpecifications = {
  [SnapCaveatType.TransactionOrigin]: Object.freeze({
    type: SnapCaveatType.TransactionOrigin,
    validator: (caveat) => validateCaveat(caveat)
  })
};

export {
  transactionInsightEndowmentBuilder,
  getTransactionInsightCaveatMapper,
  getTransactionOriginCaveat,
  transactionInsightCaveatSpecifications
};
//# sourceMappingURL=chunk-PIRQCNBJ.mjs.map