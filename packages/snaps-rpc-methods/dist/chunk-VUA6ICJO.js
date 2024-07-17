"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/restricted/getBip44Entropy.ts
var _keytree = require('@metamask/key-tree');
var _permissioncontroller = require('@metamask/permission-controller');
var _rpcerrors = require('@metamask/rpc-errors');
var _snapsutils = require('@metamask/snaps-utils');
var targetName = "snap_getBip44Entropy";
var specificationBuilder = ({ methodHooks: methodHooks2 }) => {
  return {
    permissionType: _permissioncontroller.PermissionType.RestrictedMethod,
    targetName,
    allowedCaveats: [_snapsutils.SnapCaveatType.PermittedCoinTypes],
    methodImplementation: getBip44EntropyImplementation(methodHooks2),
    validator: ({ caveats }) => {
      if (caveats?.length !== 1 || caveats[0].type !== _snapsutils.SnapCaveatType.PermittedCoinTypes) {
        throw _rpcerrors.rpcErrors.invalidParams({
          message: `Expected a single "${_snapsutils.SnapCaveatType.PermittedCoinTypes}" caveat.`
        });
      }
    },
    subjectTypes: [_permissioncontroller.SubjectType.Snap]
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
    const node = await _keytree.BIP44CoinTypeNode.fromDerivationPath([
      await getMnemonic(),
      `bip32:44'`,
      `bip32:${params.coinType}'`
    ]);
    return node.toJSON();
  };
}




exports.getBip44EntropyBuilder = getBip44EntropyBuilder; exports.getBip44EntropyImplementation = getBip44EntropyImplementation;
//# sourceMappingURL=chunk-VUA6ICJO.js.map