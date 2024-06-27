"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/restricted/invokeSnap.ts
var _permissioncontroller = require('@metamask/permission-controller');
var _rpcerrors = require('@metamask/rpc-errors');
var _snapsutils = require('@metamask/snaps-utils');
var WALLET_SNAP_PERMISSION_KEY = "wallet_snap";
var handleSnapInstall = async ({ requestData, messagingSystem }) => {
  const snaps = requestData.permissions[WALLET_SNAP_PERMISSION_KEY].caveats?.[0].value;
  const permittedSnaps = messagingSystem.call(
    `SnapController:getPermitted`,
    requestData.metadata.origin
  );
  const dedupedSnaps = Object.keys(snaps).reduce(
    (filteredSnaps, snap) => {
      if (!permittedSnaps[snap]) {
        filteredSnaps[snap] = snaps[snap];
      }
      return filteredSnaps;
    },
    {}
  );
  return messagingSystem.call(
    `SnapController:install`,
    requestData.metadata.origin,
    dedupedSnaps
  );
};
var specificationBuilder = ({ methodHooks: methodHooks2 }) => {
  return {
    permissionType: _permissioncontroller.PermissionType.RestrictedMethod,
    targetName: WALLET_SNAP_PERMISSION_KEY,
    allowedCaveats: [_snapsutils.SnapCaveatType.SnapIds],
    methodImplementation: getInvokeSnapImplementation(methodHooks2),
    validator: ({ caveats }) => {
      if (caveats?.length !== 1 || caveats[0].type !== _snapsutils.SnapCaveatType.SnapIds) {
        throw _rpcerrors.rpcErrors.invalidParams({
          message: `Expected a single "${_snapsutils.SnapCaveatType.SnapIds}" caveat.`
        });
      }
    },
    sideEffect: {
      onPermitted: handleSnapInstall
    }
  };
};
var methodHooks = {
  getSnap: true,
  handleSnapRpcRequest: true
};
var invokeSnapBuilder = Object.freeze({
  targetName: WALLET_SNAP_PERMISSION_KEY,
  specificationBuilder,
  methodHooks
});
function getInvokeSnapImplementation({
  getSnap,
  handleSnapRpcRequest
}) {
  return async function invokeSnap(options) {
    const { params = {}, context } = options;
    const { snapId, request } = params;
    if (!getSnap(snapId)) {
      throw _rpcerrors.rpcErrors.invalidRequest({
        message: `The snap "${snapId}" is not installed. Please install it first, before invoking the snap.`
      });
    }
    const { origin } = context;
    return await handleSnapRpcRequest({
      snapId,
      origin,
      request,
      handler: _snapsutils.HandlerType.OnRpcRequest
    });
  };
}






exports.WALLET_SNAP_PERMISSION_KEY = WALLET_SNAP_PERMISSION_KEY; exports.handleSnapInstall = handleSnapInstall; exports.invokeSnapBuilder = invokeSnapBuilder; exports.getInvokeSnapImplementation = getInvokeSnapImplementation;
//# sourceMappingURL=chunk-FFHVA6PP.js.map