"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STORAGE_SIZE_LIMIT = exports.ManageStateOperation = exports.manageStateBuilder = void 0;
const controllers_1 = require("@metamask/controllers");
const utils_1 = require("@metamask/utils");
const eth_rpc_errors_1 = require("eth-rpc-errors");
const methodName = 'snap_manageState';
/**
 * The specification builder for the `snap_manageState` permission.
 * `snap_manageState` lets the Snap store and manage some of its state on
 * your device.
 *
 * @param options - The specification builder options.
 * @param options.allowedCaveats - The optional allowed caveats for the permission.
 * @param options.methodHooks - The RPC method hooks needed by the method implementation.
 * @returns The specification for the `snap_manageState` permission.
 */
const specificationBuilder = ({ allowedCaveats = null, methodHooks, }) => {
    return {
        permissionType: controllers_1.PermissionType.RestrictedMethod,
        targetKey: methodName,
        allowedCaveats,
        methodImplementation: getManageStateImplementation(methodHooks),
    };
};
exports.manageStateBuilder = Object.freeze({
    targetKey: methodName,
    specificationBuilder,
    methodHooks: {
        clearSnapState: true,
        getSnapState: true,
        updateSnapState: true,
    },
});
var ManageStateOperation;
(function (ManageStateOperation) {
    ManageStateOperation["clearState"] = "clear";
    ManageStateOperation["getState"] = "get";
    ManageStateOperation["updateState"] = "update";
})(ManageStateOperation = exports.ManageStateOperation || (exports.ManageStateOperation = {}));
exports.STORAGE_SIZE_LIMIT = 104857600; // In bytes (100MB)
/**
 * Builds the method implementation for `snap_manageState`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.clearSnapState - A function that clears the state stored for a snap.
 * @param hooks.getSnapState - A function that fetches the persisted decrypted state for a snap.
 * @param hooks.updateSnapState - A function that updates the state stored for a snap.
 * @returns The method implementation which either returns `null` for a successful state update/deletion or returns the decrypted state.
 * @throws If the params are invalid.
 */
function getManageStateImplementation({ clearSnapState, getSnapState, updateSnapState, }) {
    return async function manageState(options) {
        const { params = [], method, context: { origin }, } = options;
        const [operation, newState] = params;
        switch (operation) {
            case ManageStateOperation.clearState:
                await clearSnapState(origin);
                return null;
            case ManageStateOperation.getState:
                return await getSnapState(origin);
            case ManageStateOperation.updateState: {
                if (!(0, utils_1.isObject)(newState)) {
                    throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
                        message: `Invalid ${method} "updateState" parameter: The new state must be a plain object.`,
                        data: {
                            receivedNewState: typeof newState === 'undefined' ? 'undefined' : newState,
                        },
                    });
                }
                const [isValid, plainTextSizeInBytes] = (0, utils_1.validateJsonAndGetSize)(newState);
                if (!isValid) {
                    throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
                        message: `Invalid ${method} "updateState" parameter: The new state must be JSON serializable.`,
                        data: {
                            receivedNewState: typeof newState === 'undefined' ? 'undefined' : newState,
                        },
                    });
                }
                else if (plainTextSizeInBytes > exports.STORAGE_SIZE_LIMIT) {
                    throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
                        message: `Invalid ${method} "updateState" parameter: The new state must not exceed ${exports.STORAGE_SIZE_LIMIT} bytes in size.`,
                        data: {
                            receivedNewState: typeof newState === 'undefined' ? 'undefined' : newState,
                        },
                    });
                }
                await updateSnapState(origin, newState);
                return null;
            }
            default:
                throw eth_rpc_errors_1.ethErrors.rpc.invalidParams(`Invalid ${method} operation: "${operation}"`);
        }
    };
}
//# sourceMappingURL=manageState.js.map