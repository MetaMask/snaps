"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppKeyHandler = void 0;
const eth_rpc_errors_1 = require("eth-rpc-errors");
/**
 * `snap_getAppKey` gets the Snap's app key.
 */
exports.getAppKeyHandler = {
    methodNames: ['snap_getAppKey'],
    implementation: getAppKeyImplementation,
    hookNames: {
        getAppKey: true,
        getUnlockPromise: true,
    },
};
/**
 * The `snap_getAppKey` method implementation.
 * Tries to fetch an "app key" for the requesting snap and adds it to the JSON-RPC response.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.getAppKey - A function that retrieves an "app key" for the requesting snap.
 * @param hooks.getUnlockPromise - A function that resolves once the MetaMask extension is unlocked and prompts the user to unlock their MetaMask if it is locked.
 * @returns A promise that resolves once the JSON-RPC response has been modified.
 * @throws If the params are invalid.
 */
async function getAppKeyImplementation(req, res, _next, end, { getAppKey, getUnlockPromise }) {
    const [requestedAccount] = (req === null || req === void 0 ? void 0 : req.params) || [];
    if (requestedAccount !== undefined &&
        (!requestedAccount || typeof requestedAccount !== 'string')) {
        return end(eth_rpc_errors_1.ethErrors.rpc.invalidParams({
            message: 'Must omit params completely or specify a single hexadecimal string Ethereum account.',
        }));
    }
    try {
        await getUnlockPromise(true);
        res.result = await getAppKey(requestedAccount);
        return end();
    }
    catch (error) {
        return end(error);
    }
}
//# sourceMappingURL=getAppKey.js.map