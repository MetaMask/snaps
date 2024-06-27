// src/restricted/manageAccounts.ts
import { SubjectType, PermissionType } from "@metamask/permission-controller";
import {
  assert,
  string,
  object,
  union,
  array,
  record
} from "@metamask/superstruct";
import { JsonStruct } from "@metamask/utils";
var SnapMessageStruct = union([
  object({
    method: string()
  }),
  object({
    method: string(),
    params: union([array(JsonStruct), record(string(), JsonStruct)])
  })
]);
var methodName = "snap_manageAccounts";
var specificationBuilder = ({
  allowedCaveats = null,
  methodHooks
}) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetName: methodName,
    allowedCaveats,
    methodImplementation: manageAccountsImplementation(methodHooks),
    subjectTypes: [SubjectType.Snap]
  };
};
function manageAccountsImplementation({
  getSnapKeyring
}) {
  return async function manageAccounts(options) {
    const {
      context: { origin },
      params
    } = options;
    assert(params, SnapMessageStruct);
    const keyring = await getSnapKeyring(origin);
    return await keyring.handleKeyringSnapMessage(origin, params);
  };
}
var manageAccountsBuilder = Object.freeze({
  targetName: methodName,
  specificationBuilder,
  methodHooks: {
    getSnapKeyring: true
  }
});

export {
  methodName,
  specificationBuilder,
  manageAccountsImplementation,
  manageAccountsBuilder
};
//# sourceMappingURL=chunk-Z6YFGWHN.mjs.map