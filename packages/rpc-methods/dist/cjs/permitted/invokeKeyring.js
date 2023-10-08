"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "invokeKeyringHandler", {
    enumerable: true,
    get: function() {
        return invokeKeyringHandler;
    }
});
const _snapsutils = require("@metamask/snaps-utils");
const _utils = require("@metamask/utils");
const _ethrpcerrors = require("eth-rpc-errors");
const _invokeSnapSugar = require("./invokeSnapSugar");
const hookNames = {
    hasPermission: true,
    handleSnapRpcRequest: true,
    getSnap: true,
    getAllowedKeyringMethods: true
};
const invokeKeyringHandler = {
    methodNames: [
        'wallet_invokeKeyring'
    ],
    implementation: invokeKeyringImplementation,
    hookNames
};
/**
 * The `wallet_invokeKeyring` method implementation.
 * Invokes onKeyringRequest if the snap requested is installed and connected to the dapp.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.handleSnapRpcRequest - Invokes a snap with a given RPC request.
 * @param hooks.hasPermission - Checks whether a given origin has a given permission.
 * @param hooks.getSnap - Gets information about a given snap.
 * @param hooks.getAllowedKeyringMethods - Get the list of allowed Keyring
 * methods for a given origin.
 * @returns Nothing.
 */ async function invokeKeyringImplementation(req, res, _next, end, { handleSnapRpcRequest, hasPermission, getSnap, getAllowedKeyringMethods }) {
    let params;
    try {
        params = (0, _invokeSnapSugar.getValidatedParams)(req.params);
    } catch (error) {
        return end(error);
    }
    // We expect the MM middleware stack to always add the origin to requests
    const { origin } = req;
    const { snapId, request } = params;
    if (!origin || !hasPermission(origin, _snapsutils.WALLET_SNAP_PERMISSION_KEY)) {
        return end(_ethrpcerrors.ethErrors.rpc.invalidRequest({
            message: `The snap "${snapId}" is not connected to "${origin}". Please connect before invoking the snap.`
        }));
    }
    if (!getSnap(snapId)) {
        return end(_ethrpcerrors.ethErrors.rpc.invalidRequest({
            message: `The snap "${snapId}" is not installed. Please install it first, before invoking the snap.`
        }));
    }
    if (!(0, _utils.hasProperty)(request, 'method') || typeof request.method !== 'string') {
        return end(_ethrpcerrors.ethErrors.rpc.invalidRequest({
            message: 'The request must have a method.'
        }));
    }
    const allowedMethods = getAllowedKeyringMethods(origin);
    if (!allowedMethods.includes(request.method)) {
        return end(_ethrpcerrors.ethErrors.rpc.invalidRequest({
            message: `The origin "${origin}" is not allowed to invoke the method "${request.method}".`
        }));
    }
    try {
        res.result = await handleSnapRpcRequest({
            snapId,
            origin,
            request,
            handler: _snapsutils.HandlerType.OnKeyringRequest
        });
    } catch (error) {
        return end(error);
    }
    return end();
}

//# sourceMappingURL=invokeKeyring.js.map