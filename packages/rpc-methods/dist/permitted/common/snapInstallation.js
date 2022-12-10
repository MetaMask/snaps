"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleInstallSnaps = exports.preprocessRequestedPermissions = void 0;
const eth_rpc_errors_1 = require("eth-rpc-errors");
const utils_1 = require("@metamask/utils");
const snap_utils_1 = require("@metamask/snap-utils");
/**
 * Preprocesses requested permissions to support `wallet_snap` syntactic sugar. This is done by
 * replacing instances of `wallet_snap` with `wallet_snap_${snapId}`.
 *
 * @param requestedPermissions - The existing permissions object.
 * @returns The modified permissions request.
 */
function preprocessRequestedPermissions(requestedPermissions) {
    if (!(0, utils_1.isObject)(requestedPermissions)) {
        throw eth_rpc_errors_1.ethErrors.rpc.invalidRequest({ data: { requestedPermissions } });
    }
    // passthrough if 'wallet_snap' is not requested
    if (!requestedPermissions.wallet_snap) {
        return requestedPermissions;
    }
    // rewrite permissions request parameter by destructuring snaps into
    // proper permissions prefixed with 'wallet_snap_'
    return Object.keys(requestedPermissions).reduce((newRequestedPermissions, permName) => {
        if (permName === 'wallet_snap') {
            if (!(0, utils_1.isObject)(requestedPermissions[permName])) {
                throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
                    message: `Invalid params to 'wallet_requestPermissions'`,
                    data: { requestedPermissions },
                });
            }
            const requestedSnaps = requestedPermissions[permName];
            // destructure 'wallet_snap' object
            Object.keys(requestedSnaps).forEach((snapId) => {
                const snapKey = snap_utils_1.SNAP_PREFIX + snapId;
                // disallow requesting a snap X under 'wallet_snaps' and
                // directly as 'wallet_snap_X'
                if (requestedPermissions[snapKey]) {
                    throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
                        message: `Snap '${snapId}' requested both as direct permission and under 'wallet_snap'. We recommend using 'wallet_snap' only.`,
                        data: { requestedPermissions },
                    });
                }
                newRequestedPermissions[snapKey] = requestedSnaps[snapId];
            });
        }
        else {
            // otherwise, leave things as we found them
            newRequestedPermissions[permName] = requestedPermissions[permName];
        }
        return newRequestedPermissions;
    }, {});
}
exports.preprocessRequestedPermissions = preprocessRequestedPermissions;
/**
 * Typechecks the requested snaps and passes them to the permissions
 * controller for installation.
 *
 * @param requestedSnaps - An object containing the requested snaps to be installed. The key of the
 * object is the snap id and the value is potential extra data, i.e. version.
 * @param installSnaps - A function that tries to install a given snap, prompting the user if
 * necessary.
 * @returns An object containing the installed snaps.
 * @throws If the params are invalid or the snap installation fails.
 */
async function handleInstallSnaps(requestedSnaps, installSnaps) {
    if (!(0, utils_1.isObject)(requestedSnaps)) {
        throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
            message: `Invalid snap installation params.`,
            data: { requestedSnaps },
        });
    }
    else if (Object.keys(requestedSnaps).length === 0) {
        throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
            message: `Must specify at least one snap to install.`,
            data: { requestedSnaps },
        });
    }
    // installSnaps is bound to the origin
    return await installSnaps(requestedSnaps);
}
exports.handleInstallSnaps = handleInstallSnaps;
//# sourceMappingURL=snapInstallation.js.map