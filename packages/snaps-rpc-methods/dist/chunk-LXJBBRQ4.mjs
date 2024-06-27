import {
  getNode
} from "./chunk-W33UWNA2.mjs";

// src/restricted/getBip32Entropy.ts
import { PermissionType, SubjectType } from "@metamask/permission-controller";
import { rpcErrors } from "@metamask/rpc-errors";
import { SnapCaveatType } from "@metamask/snaps-utils";
import { assert } from "@metamask/utils";
var targetName = "snap_getBip32Entropy";
var specificationBuilder = ({ methodHooks: methodHooks2 }) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetName,
    allowedCaveats: [SnapCaveatType.PermittedDerivationPaths],
    methodImplementation: getBip32EntropyImplementation(methodHooks2),
    validator: ({ caveats }) => {
      if (caveats?.length !== 1 || caveats[0].type !== SnapCaveatType.PermittedDerivationPaths) {
        throw rpcErrors.invalidParams({
          message: `Expected a single "${SnapCaveatType.PermittedDerivationPaths}" caveat.`
        });
      }
    },
    subjectTypes: [SubjectType.Snap]
  };
};
var methodHooks = {
  getMnemonic: true,
  getUnlockPromise: true
};
var getBip32EntropyBuilder = Object.freeze({
  targetName,
  specificationBuilder,
  methodHooks
});
function getBip32EntropyImplementation({
  getMnemonic,
  getUnlockPromise
}) {
  return async function getBip32Entropy(args) {
    await getUnlockPromise(true);
    const { params } = args;
    assert(params);
    const node = await getNode({
      curve: params.curve,
      path: params.path,
      secretRecoveryPhrase: await getMnemonic()
    });
    return node.toJSON();
  };
}

export {
  getBip32EntropyBuilder,
  getBip32EntropyImplementation
};
//# sourceMappingURL=chunk-LXJBBRQ4.mjs.map