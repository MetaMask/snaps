"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invokeSnapSugarHandler = void 0;
const eth_rpc_errors_1 = require("eth-rpc-errors");
const utils_1 = require("@metamask/utils");
const snap_utils_1 = require("@metamask/snap-utils");
/**
 * `wallet_invokeSnap` attempts to invoke an RPC method of the specified Snap.
 */
exports.invokeSnapSugarHandler = {
    methodNames: ['wallet_invokeSnap'],
    implementation: invokeSnapSugar,
    hookNames: undefined,
};
/**
 * The `wallet_invokeSnap` method implementation.
 * Reroutes incoming JSON-RPC requests that are targeting snaps, by modifying the method and params.
 *
 * @param req - The JSON-RPC request object.
 * @param _res - The JSON-RPC response object. Not used by this
 * function.
 * @param next - The `json-rpc-engine` "next" callback.
 * @param end - The `json-rpc-engine` "end" callback.
 * @returns Nothing.
 * @throws If the params are invalid.
 */
function invokeSnapSugar(req, _res, next, end) {
    if (!Array.isArray(req.params) ||
        typeof req.params[0] !== 'string' ||
        !(0, utils_1.isObject)(req.params[1])) {
        return end(eth_rpc_errors_1.ethErrors.rpc.invalidParams({
            message: 'Must specify a string snap ID and a plain request object.',
        }));
    }
    req.method = snap_utils_1.SNAP_PREFIX + req.params[0];
    req.params = [req.params[1]];
    return next();
}
//# sourceMappingURL=invokeSnapSugar.js.map