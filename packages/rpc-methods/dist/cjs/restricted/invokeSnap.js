"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    WALLET_SNAP_PERMISSION_KEY: function() {
        return WALLET_SNAP_PERMISSION_KEY;
    },
    handleSnapInstall: function() {
        return handleSnapInstall;
    },
    invokeSnapBuilder: function() {
        return invokeSnapBuilder;
    },
    getInvokeSnapImplementation: function() {
        return getInvokeSnapImplementation;
    }
});
const _permissioncontroller = require("@metamask/permission-controller");
const _snapsutils = require("@metamask/snaps-utils");
const _ethrpcerrors = require("eth-rpc-errors");
const WALLET_SNAP_PERMISSION_KEY = 'wallet_snap';
const handleSnapInstall = async ({ requestData, messagingSystem })=>{
    const snaps = requestData.permissions[WALLET_SNAP_PERMISSION_KEY].caveats?.[0].value;
    const permittedSnaps = messagingSystem.call(`SnapController:getPermitted`, requestData.metadata.origin);
    const dedupedSnaps = Object.keys(snaps).reduce((filteredSnaps, snap)=>{
        if (!permittedSnaps[snap]) {
            filteredSnaps[snap] = snaps[snap];
        }
        return filteredSnaps;
    }, {});
    return messagingSystem.call(`SnapController:install`, requestData.metadata.origin, dedupedSnaps);
};
/**
 * The specification builder for the `wallet_snap_*` permission.
 *
 * `wallet_snap_*` attempts to invoke an RPC method of the specified Snap.
 *
 * Requesting its corresponding permission will attempt to connect to the Snap,
 * and install it if it's not available yet.
 *
 * @param options - The specification builder options.
 * @param options.methodHooks - The RPC method hooks needed by the method implementation.
 * @returns The specification for the `wallet_snap_*` permission.
 */ const specificationBuilder = ({ methodHooks })=>{
    return {
        permissionType: _permissioncontroller.PermissionType.RestrictedMethod,
        targetName: WALLET_SNAP_PERMISSION_KEY,
        allowedCaveats: [
            _snapsutils.SnapCaveatType.SnapIds
        ],
        methodImplementation: getInvokeSnapImplementation(methodHooks),
        validator: ({ caveats })=>{
            if (caveats?.length !== 1 || caveats[0].type !== _snapsutils.SnapCaveatType.SnapIds) {
                throw _ethrpcerrors.ethErrors.rpc.invalidParams({
                    message: `Expected a single "${_snapsutils.SnapCaveatType.SnapIds}" caveat.`
                });
            }
        },
        sideEffect: {
            onPermitted: handleSnapInstall
        }
    };
};
const methodHooks = {
    getSnap: true,
    handleSnapRpcRequest: true
};
const invokeSnapBuilder = Object.freeze({
    targetName: WALLET_SNAP_PERMISSION_KEY,
    specificationBuilder,
    methodHooks
});
function getInvokeSnapImplementation({ getSnap, handleSnapRpcRequest }) {
    return async function invokeSnap(options) {
        const { params = {}, context } = options;
        const { snapId, request } = params;
        if (!getSnap(snapId)) {
            throw _ethrpcerrors.ethErrors.rpc.invalidRequest({
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

//# sourceMappingURL=invokeSnap.js.map