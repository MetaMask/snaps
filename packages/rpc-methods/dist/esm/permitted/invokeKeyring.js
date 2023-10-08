import { HandlerType, WALLET_SNAP_PERMISSION_KEY } from '@metamask/snaps-utils';
import { hasProperty } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';
import { getValidatedParams } from './invokeSnapSugar';
const hookNames = {
    hasPermission: true,
    handleSnapRpcRequest: true,
    getSnap: true,
    getAllowedKeyringMethods: true
};
/**
 * `wallet_invokeKeyring` gets the requester's permitted and installed Snaps.
 */ export const invokeKeyringHandler = {
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
        params = getValidatedParams(req.params);
    } catch (error) {
        return end(error);
    }
    // We expect the MM middleware stack to always add the origin to requests
    const { origin } = req;
    const { snapId, request } = params;
    if (!origin || !hasPermission(origin, WALLET_SNAP_PERMISSION_KEY)) {
        return end(ethErrors.rpc.invalidRequest({
            message: `The snap "${snapId}" is not connected to "${origin}". Please connect before invoking the snap.`
        }));
    }
    if (!getSnap(snapId)) {
        return end(ethErrors.rpc.invalidRequest({
            message: `The snap "${snapId}" is not installed. Please install it first, before invoking the snap.`
        }));
    }
    if (!hasProperty(request, 'method') || typeof request.method !== 'string') {
        return end(ethErrors.rpc.invalidRequest({
            message: 'The request must have a method.'
        }));
    }
    const allowedMethods = getAllowedKeyringMethods(origin);
    if (!allowedMethods.includes(request.method)) {
        return end(ethErrors.rpc.invalidRequest({
            message: `The origin "${origin}" is not allowed to invoke the method "${request.method}".`
        }));
    }
    try {
        res.result = await handleSnapRpcRequest({
            snapId,
            origin,
            request,
            handler: HandlerType.OnKeyringRequest
        });
    } catch (error) {
        return end(error);
    }
    return end();
}

//# sourceMappingURL=invokeKeyring.js.map