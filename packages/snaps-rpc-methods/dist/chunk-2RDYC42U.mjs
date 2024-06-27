import {
  deriveEntropy
} from "./chunk-W33UWNA2.mjs";

// src/restricted/getEntropy.ts
import { PermissionType, SubjectType } from "@metamask/permission-controller";
import { rpcErrors } from "@metamask/rpc-errors";
import { SIP_6_MAGIC_VALUE } from "@metamask/snaps-utils";
import { literal, object, optional, string } from "@metamask/superstruct";
import { assertStruct } from "@metamask/utils";
var targetName = "snap_getEntropy";
var GetEntropyArgsStruct = object({
  version: literal(1),
  salt: optional(string())
});
var specificationBuilder = ({
  allowedCaveats = null,
  methodHooks: methodHooks2
}) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetName,
    allowedCaveats,
    methodImplementation: getEntropyImplementation(methodHooks2),
    subjectTypes: [SubjectType.Snap]
  };
};
var methodHooks = {
  getMnemonic: true,
  getUnlockPromise: true
};
var getEntropyBuilder = Object.freeze({
  targetName,
  specificationBuilder,
  methodHooks
});
function getEntropyImplementation({
  getMnemonic,
  getUnlockPromise
}) {
  return async function getEntropy(options) {
    const {
      params,
      context: { origin }
    } = options;
    assertStruct(
      params,
      GetEntropyArgsStruct,
      'Invalid "snap_getEntropy" parameters',
      rpcErrors.invalidParams
    );
    await getUnlockPromise(true);
    const mnemonicPhrase = await getMnemonic();
    return deriveEntropy({
      input: origin,
      salt: params.salt,
      mnemonicPhrase,
      magic: SIP_6_MAGIC_VALUE
    });
  };
}

export {
  GetEntropyArgsStruct,
  getEntropyBuilder
};
//# sourceMappingURL=chunk-2RDYC42U.mjs.map