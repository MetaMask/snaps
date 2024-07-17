"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunk33MTKZ4Hjs = require('./chunk-33MTKZ4H.js');

// src/restricted/getBip32PublicKey.ts
var _permissioncontroller = require('@metamask/permission-controller');
var _rpcerrors = require('@metamask/rpc-errors');





var _snapsutils = require('@metamask/snaps-utils');
var _superstruct = require('@metamask/superstruct');
var _utils = require('@metamask/utils');
var targetName = "snap_getBip32PublicKey";
var Bip32PublicKeyArgsStruct = _snapsutils.bip32entropy.call(void 0, 
  _superstruct.object.call(void 0, {
    path: _snapsutils.Bip32PathStruct,
    curve: _snapsutils.CurveStruct,
    compressed: _superstruct.optional.call(void 0, _superstruct.boolean.call(void 0, ))
  })
);
var specificationBuilder = ({ methodHooks: methodHooks2 }) => {
  return {
    permissionType: _permissioncontroller.PermissionType.RestrictedMethod,
    targetName,
    allowedCaveats: [_snapsutils.SnapCaveatType.PermittedDerivationPaths],
    methodImplementation: getBip32PublicKeyImplementation(methodHooks2),
    validator: ({ caveats }) => {
      if (caveats?.length !== 1 || caveats[0].type !== _snapsutils.SnapCaveatType.PermittedDerivationPaths) {
        throw _rpcerrors.rpcErrors.invalidParams({
          message: `Expected a single "${_snapsutils.SnapCaveatType.PermittedDerivationPaths}" caveat.`
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
    _utils.assertStruct.call(void 0, 
      args.params,
      Bip32PublicKeyArgsStruct,
      "Invalid BIP-32 public key params",
      _rpcerrors.rpcErrors.invalidParams
    );
    const { params } = args;
    const node = await _chunk33MTKZ4Hjs.getNode.call(void 0, {
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





exports.Bip32PublicKeyArgsStruct = Bip32PublicKeyArgsStruct; exports.getBip32PublicKeyBuilder = getBip32PublicKeyBuilder; exports.getBip32PublicKeyImplementation = getBip32PublicKeyImplementation;
//# sourceMappingURL=chunk-4PWFZPJC.js.map