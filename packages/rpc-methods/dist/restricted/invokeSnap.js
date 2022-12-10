"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInvokeSnapImplementation = exports.invokeSnapBuilder = void 0;
const controllers_1 = require("@metamask/controllers");
const utils_1 = require("@metamask/utils");
const eth_rpc_errors_1 = require("eth-rpc-errors");
const snap_utils_1 = require("@metamask/snap-utils");
const nanoid_1 = require("nanoid");
const methodPrefix = snap_utils_1.SNAP_PREFIX;
const targetKey = `${methodPrefix}*`;
/**
 * The specification builder for the `wallet_snap_*` permission.
 *
 * `wallet_snap_*` attempts to invoke an RPC method of the specified Snap.
 *
 * Requesting its corresponding permission will attempt to connect to the Snap,
 * and install it if it's not avaialble yet.
 *
 * @param options - The specification builder options.
 * @param options.allowedCaveats - The optional allowed caveats for the permission.
 * @param options.methodHooks - The RPC method hooks needed by the method implementation.
 * @returns The specification for the `wallet_snap_*` permission.
 */
const specificationBuilder = ({ allowedCaveats = null, methodHooks, }) => {
    return {
        permissionType: controllers_1.PermissionType.RestrictedMethod,
        targetKey,
        allowedCaveats,
        methodImplementation: getInvokeSnapImplementation(methodHooks),
    };
};
exports.invokeSnapBuilder = Object.freeze({
    targetKey,
    specificationBuilder,
    methodHooks: {
        getSnap: true,
        handleSnapRpcRequest: true,
    },
});
/**
 * Builds the method implementation for `wallet_snap_*`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.getSnap - A function that retrieves all information stored about a snap.
 * @param hooks.handleSnapRpcRequest - A function that sends an RPC request to a snap's RPC handler or throws if that fails.
 * @returns The method implementation which returns the result of `handleSnapRpcRequest`.
 * @throws If the params are invalid.
 */
function getInvokeSnapImplementation({ getSnap, handleSnapRpcRequest, }) {
    return async function invokeSnap(options) {
        const { params = [], method, context } = options;
        const rawRequest = params[0];
        const request = Object.assign({ jsonrpc: '2.0', id: (0, nanoid_1.nanoid)() }, rawRequest);
        if (!(0, utils_1.isJsonRpcRequest)(request)) {
            throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
                message: 'Must specify a valid JSON-RPC request object as single parameter.',
            });
        }
        const snapId = method.slice(snap_utils_1.SNAP_PREFIX.length);
        if (!getSnap(snapId)) {
            throw eth_rpc_errors_1.ethErrors.rpc.invalidRequest({
                message: `The snap "${snapId}" is not installed. This is a bug, please report it.`,
            });
        }
        const { origin } = context;
        return (await handleSnapRpcRequest({
            snapId,
            origin,
            request,
            handler: snap_utils_1.HandlerType.OnRpcRequest,
        }));
    };
}
exports.getInvokeSnapImplementation = getInvokeSnapImplementation;
//# sourceMappingURL=invokeSnap.js.map