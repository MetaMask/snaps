"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunk33MTKZ4Hjs = require('./chunk-33MTKZ4H.js');

// src/restricted/getBip32Entropy.ts
var _permissioncontroller = require('@metamask/permission-controller');
var _rpcerrors = require('@metamask/rpc-errors');
var _snapsutils = require('@metamask/snaps-utils');
var _utils = require('@metamask/utils');
var targetName = "snap_getBip32Entropy";
var specificationBuilder = ({ methodHooks: methodHooks2 }) => {
  return {
    permissionType: _permissioncontroller.PermissionType.RestrictedMethod,
    targetName,
    allowedCaveats: [_snapsutils.SnapCaveatType.PermittedDerivationPaths],
    methodImplementation: getBip32EntropyImplementation(methodHooks2),
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
    _utils.assert.call(void 0, params);
    const node = await _chunk33MTKZ4Hjs.getNode.call(void 0, {
      curve: params.curve,
      path: params.path,
      secretRecoveryPhrase: await getMnemonic()
    });
    return node.toJSON();
  };
}




exports.getBip32EntropyBuilder = getBip32EntropyBuilder; exports.getBip32EntropyImplementation = getBip32EntropyImplementation;
//# sourceMappingURL=chunk-IE6EHYEG.js.map