import {
  getNode
} from "./chunk-W33UWNA2.mjs";

// src/restricted/getBip32PublicKey.ts
import { PermissionType, SubjectType } from "@metamask/permission-controller";
import { rpcErrors } from "@metamask/rpc-errors";
import {
  bip32entropy,
  Bip32PathStruct,
  CurveStruct,
  SnapCaveatType
} from "@metamask/snaps-utils";
import { boolean, object, optional } from "@metamask/superstruct";
import { assertStruct } from "@metamask/utils";
var targetName = "snap_getBip32PublicKey";
var Bip32PublicKeyArgsStruct = bip32entropy(
  object({
    path: Bip32PathStruct,
    curve: CurveStruct,
    compressed: optional(boolean())
  })
);
var specificationBuilder = ({ methodHooks: methodHooks2 }) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetName,
    allowedCaveats: [SnapCaveatType.PermittedDerivationPaths],
    methodImplementation: getBip32PublicKeyImplementation(methodHooks2),
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
var getBip32PublicKeyBuilder = Object.freeze({
  targetName,
  specificationBuilder,
  methodHooks
});
function getBip32PublicKeyImplementation({
  getMnemonic,
  getUnlockPromise
}) {
  return async function getBip32PublicKey(args) {
    await getUnlockPromise(true);
    assertStruct(
      args.params,
      Bip32PublicKeyArgsStruct,
      "Invalid BIP-32 public key params",
      rpcErrors.invalidParams
    );
    const { params } = args;
    const node = await getNode({
      curve: params.curve,
      path: params.path,
      secretRecoveryPhrase: await getMnemonic()
    });
    if (params.compressed) {
      return node.compressedPublicKey;
    }
    return node.publicKey;
  };
}

export {
  Bip32PublicKeyArgsStruct,
  getBip32PublicKeyBuilder,
  getBip32PublicKeyImplementation
};
//# sourceMappingURL=chunk-VYII7C3J.mjs.map