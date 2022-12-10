"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enableWalletHandler = void 0;
const snap_utils_1 = require("@metamask/snap-utils");
const utils_1 = require("@metamask/utils");
const eth_rpc_errors_1 = require("eth-rpc-errors");
const snapInstallation_1 = require("./common/snapInstallation");
/**
 * `wallet_enable` is a convenience method that takes a request permissions
 * object as its single parameter, and then calls `wallet_requestPermissions`,
 * `wallet_installSnaps`, and `eth_accounts` as appropriate based on the
 * requested permissions. The method returns a single object result with
 * separate properties for the return values of each method, and any errors
 * that occurred:
 *
 * `{ accounts, permissions, snaps, errors? }`
 */
exports.enableWalletHandler = {
    methodNames: ['wallet_enable'],
    implementation: enableWallet,
    hookNames: {
        getAccounts: true,
        installSnaps: true,
        requestPermissions: true,
        getPermissions: true,
    },
};
/**
 * Checks whether existing permissions satisfy the requested permissions
 *
 * Note: Currently, we don't compare caveats, if any caveats are requested, we always return false.
 *
 * @param existingPermissions - The existing permissions for the origin.
 * @param requestedPermissions - The requested permissions for the origin.
 * @returns True if the existing permissions satisfy the requested permissions, otherwise false.
 */
function hasPermissions(existingPermissions, requestedPermissions) {
    return Object.entries(requestedPermissions).every(([target, requestedPermission]) => {
        if ((requestedPermission === null || requestedPermission === void 0 ? void 0 : requestedPermission.caveats) &&
            requestedPermission.caveats.length > 0) {
            return false;
        }
        return (0, utils_1.hasProperty)(existingPermissions, target);
    });
}
/**
 * The `wallet_enable` method implementation. See {@link enableWalletHandler}
 * for more information.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.getAccounts - Gets the user's Ethereum account addresses.
 * @param hooks.installSnaps - A function that installs permitted snaps.
 * @param hooks.requestPermissions - A function that requests permissions on
 * behalf of a subject.
 * @param hooks.getPermissions - A function that gets the current permissions
 * of a subject.
 * @returns Nothing.
 */
async function enableWallet(req, res, _next, end, { getAccounts, installSnaps, requestPermissions, getPermissions, }) {
    if (!Array.isArray(req.params)) {
        return end(eth_rpc_errors_1.ethErrors.rpc.invalidParams({
            message: '"params" must be an array.',
        }));
    }
    const result = {
        accounts: [],
        permissions: [],
        snaps: {},
    };
    // Request the permissions
    let requestedPermissions;
    try {
        // We expect the params to be the same as wallet_requestPermissions
        requestedPermissions = (0, snapInstallation_1.preprocessRequestedPermissions)(req.params[0]);
        const existingPermissions = await getPermissions();
        if (existingPermissions &&
            hasPermissions(existingPermissions, requestedPermissions)) {
            result.permissions = Object.values(existingPermissions);
        }
        else {
            result.permissions = await requestPermissions(requestedPermissions);
        }
        if (!result.permissions || !result.permissions.length) {
            throw eth_rpc_errors_1.ethErrors.provider.userRejectedRequest({ data: req });
        }
    }
    catch (err) {
        return end(err);
    }
    // Install snaps, if any
    // Get the names of the approved snaps
    const requestedSnaps = result.permissions
        // RequestPermissions returns all permissions for the domain,
        // so we're filtering out non-snap and preexisting permissions
        .filter((perm) => perm.parentCapability.startsWith(snap_utils_1.SNAP_PREFIX) &&
        perm.parentCapability in requestedPermissions)
        // Convert from namespaced permissions to snap ids
        .reduce((_requestedSnaps, perm) => {
        const snapId = perm.parentCapability.replace(snap_utils_1.SNAP_PREFIX_REGEX, '');
        _requestedSnaps[snapId] = requestedPermissions[perm.parentCapability];
        return _requestedSnaps;
    }, {});
    try {
        if (Object.keys(requestedSnaps).length > 0) {
            // This throws if requestedSnaps is empty
            result.snaps = await (0, snapInstallation_1.handleInstallSnaps)(requestedSnaps, installSnaps);
        }
    }
    catch (err) {
        if (!result.errors) {
            result.errors = [];
        }
        result.errors.push((0, eth_rpc_errors_1.serializeError)(err));
    }
    // Get whatever accounts we have
    result.accounts = await getAccounts();
    // Return the result
    res.result = result;
    return end();
}
//# sourceMappingURL=enable.js.map