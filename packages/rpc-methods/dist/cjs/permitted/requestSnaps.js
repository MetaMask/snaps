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
    requestSnapsHandler: function() {
        return requestSnapsHandler;
    },
    hasRequestedSnaps: function() {
        return hasRequestedSnaps;
    },
    getSnapPermissionsRequest: function() {
        return getSnapPermissionsRequest;
    }
});
const _snapsutils = require("@metamask/snaps-utils");
const _utils = require("@metamask/utils");
const _ethrpcerrors = require("eth-rpc-errors");
const _invokeSnap = require("../restricted/invokeSnap");
const _snapInstallation = require("./common/snapInstallation");
const hookNames = {
    installSnaps: true,
    requestPermissions: true,
    getPermissions: true
};
const requestSnapsHandler = {
    methodNames: [
        'wallet_requestSnaps'
    ],
    implementation: requestSnapsImplementation,
    hookNames
};
function hasRequestedSnaps(existingPermissions, requestedSnaps) {
    const snapIdCaveat = existingPermissions[_invokeSnap.WALLET_SNAP_PERMISSION_KEY]?.caveats?.find((caveat)=>caveat.type === _snapsutils.SnapCaveatType.SnapIds);
    const permittedSnaps = snapIdCaveat?.value;
    if ((0, _utils.isObject)(permittedSnaps)) {
        return Object.keys(requestedSnaps).every((requestedSnap)=>(0, _utils.hasProperty)(permittedSnaps, requestedSnap));
    }
    return false;
}
function getSnapPermissionsRequest(existingPermissions, requestedPermissions) {
    (0, _snapsutils.verifyRequestedSnapPermissions)(requestedPermissions);
    if (!existingPermissions[_invokeSnap.WALLET_SNAP_PERMISSION_KEY]) {
        return requestedPermissions;
    }
    const snapIdCaveat = existingPermissions[_invokeSnap.WALLET_SNAP_PERMISSION_KEY].caveats?.find((caveat)=>caveat.type === _snapsutils.SnapCaveatType.SnapIds);
    const permittedSnaps = (snapIdCaveat?.value) ?? {};
    const requestedSnaps = requestedPermissions[_invokeSnap.WALLET_SNAP_PERMISSION_KEY].caveats[0].value;
    const snapIdSet = new Set([
        ...Object.keys(permittedSnaps),
        ...Object.keys(requestedSnaps)
    ]);
    const mergedCaveatValue = [
        ...snapIdSet
    ].reduce((request, snapId)=>{
        request[snapId] = requestedSnaps[snapId] ?? permittedSnaps[snapId];
        return request;
    }, {});
    requestedPermissions[_invokeSnap.WALLET_SNAP_PERMISSION_KEY].caveats[0].value = mergedCaveatValue;
    return requestedPermissions;
}
/**
 * The `wallet_requestSnaps` method implementation.
 * Tries to install the requested snaps and adds them to the JSON-RPC response.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.installSnaps - A function that tries to install a given snap, prompting the user if necessary.
 * @param hooks.requestPermissions - A function that requests permissions on
 * behalf of a subject.
 * @param hooks.getPermissions - A function that gets the current permissions.
 * @returns A promise that resolves once the JSON-RPC response has been modified.
 * @throws If the params are invalid.
 */ async function requestSnapsImplementation(req, res, _next, end, { installSnaps, requestPermissions, getPermissions }) {
    const requestedSnaps = req.params;
    if (!(0, _utils.isObject)(requestedSnaps)) {
        return end(_ethrpcerrors.ethErrors.rpc.invalidParams({
            message: '"params" must be an object.'
        }));
    }
    try {
        if (!Object.keys(requestedSnaps).length) {
            throw new Error('Request must have at least one requested snap.');
        }
        const requestedPermissions = {
            [_invokeSnap.WALLET_SNAP_PERMISSION_KEY]: {
                caveats: [
                    {
                        type: _snapsutils.SnapCaveatType.SnapIds,
                        value: requestedSnaps
                    }
                ]
            }
        };
        const existingPermissions = await getPermissions();
        if (!existingPermissions) {
            const [, metadata] = await requestPermissions(requestedPermissions);
            res.result = metadata.data[_invokeSnap.WALLET_SNAP_PERMISSION_KEY];
        } else if (hasRequestedSnaps(existingPermissions, requestedSnaps)) {
            res.result = await (0, _snapInstallation.handleInstallSnaps)(requestedSnaps, installSnaps);
        } else {
            const mergedPermissionsRequest = getSnapPermissionsRequest(existingPermissions, requestedPermissions);
            const [, metadata] = await requestPermissions(mergedPermissionsRequest);
            res.result = metadata.data[_invokeSnap.WALLET_SNAP_PERMISSION_KEY];
        }
    } catch (error) {
        res.error = error;
    }
    return end();
}

//# sourceMappingURL=requestSnaps.js.map