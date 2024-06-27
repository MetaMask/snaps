// src/restricted/invokeSnap.ts
import { PermissionType } from "@metamask/permission-controller";
import { rpcErrors } from "@metamask/rpc-errors";
import { HandlerType, SnapCaveatType } from "@metamask/snaps-utils";
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
    permissionType: PermissionType.RestrictedMethod,
    targetName: WALLET_SNAP_PERMISSION_KEY,
    allowedCaveats: [SnapCaveatType.SnapIds],
    methodImplementation: getInvokeSnapImplementation(methodHooks2),
    validator: ({ caveats }) => {
      if (caveats?.length !== 1 || caveats[0].type !== SnapCaveatType.SnapIds) {
        throw rpcErrors.invalidParams({
          message: `Expected a single "${SnapCaveatType.SnapIds}" caveat.`
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
      throw rpcErrors.invalidRequest({
        message: `The snap "${snapId}" is not installed. Please install it first, before invoking the snap.`
      });
    }
    const { origin } = context;
    return await handleSnapRpcRequest({
      snapId,
      origin,
      request,
      handler: HandlerType.OnRpcRequest
    });
  };
}

export {
  WALLET_SNAP_PERMISSION_KEY,
  handleSnapInstall,
  invokeSnapBuilder,
  getInvokeSnapImplementation
};
//# sourceMappingURL=chunk-VVBTXSID.mjs.map