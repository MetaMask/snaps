"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installSnapsHandler = void 0;
const eth_rpc_errors_1 = require("eth-rpc-errors");
const snapInstallation_1 = require("./common/snapInstallation");
/**
 * `wallet_installSnaps` installs the requested Snaps, if they are permitted.
 */
exports.installSnapsHandler = {
    methodNames: ['wallet_installSnaps'],
    implementation: installSnapsImplementation,
    hookNames: {
        installSnaps: true,
    },
};
/**
 * The `wallet_installSnaps` method implementation.
 * Tries to install the requested snaps and adds them to the JSON-RPC response.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.installSnaps - A function that tries to install a given snap, prompting the user if necessary.
 * @returns A promise that resolves once the JSON-RPC response has been modified.
 * @throws If the params are invalid.
 */
async function installSnapsImplementation(req, res, _next, end, { installSnaps }) {
    if (!Array.isArray(req.params)) {
        return end(eth_rpc_errors_1.ethErrors.rpc.invalidParams({
            message: '"params" must be an array.',
        }));
    }
    try {
        res.result = await (0, snapInstallation_1.handleInstallSnaps)(req.params[0], installSnaps);
    }
    catch (err) {
        res.error = err;
    }
    return end();
}
//# sourceMappingURL=installSnaps.js.map