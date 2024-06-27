// src/restricted/getBip44Entropy.ts
import { BIP44CoinTypeNode } from "@metamask/key-tree";
import { PermissionType, SubjectType } from "@metamask/permission-controller";
import { rpcErrors } from "@metamask/rpc-errors";
import { SnapCaveatType } from "@metamask/snaps-utils";
var targetName = "snap_getBip44Entropy";
var specificationBuilder = ({ methodHooks: methodHooks2 }) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetName,
    allowedCaveats: [SnapCaveatType.PermittedCoinTypes],
    methodImplementation: getBip44EntropyImplementation(methodHooks2),
    validator: ({ caveats }) => {
      if (caveats?.length !== 1 || caveats[0].type !== SnapCaveatType.PermittedCoinTypes) {
        throw rpcErrors.invalidParams({
          message: `Expected a single "${SnapCaveatType.PermittedCoinTypes}" caveat.`
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
var getBip44EntropyBuilder = Object.freeze({
  targetName,
  specificationBuilder,
  methodHooks
});
function getBip44EntropyImplementation({
  getMnemonic,
  getUnlockPromise
}) {
  return async function getBip44Entropy(args) {
    await getUnlockPromise(true);
    const params = args.params;
    const node = await BIP44CoinTypeNode.fromDerivationPath([
      await getMnemonic(),
      `bip32:44'`,
      `bip32:${params.coinType}'`
    ]);
    return node.toJSON();
  };
}

export {
  getBip44EntropyBuilder,
  getBip44EntropyImplementation
};
//# sourceMappingURL=chunk-LR7UR4YU.mjs.map