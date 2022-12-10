"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyBuilder = exports.NotificationType = void 0;
const controllers_1 = require("@metamask/controllers");
const utils_1 = require("@metamask/utils");
const eth_rpc_errors_1 = require("eth-rpc-errors");
const methodName = 'snap_notify';
// Move all the types to a shared place when implementing more notifications
var NotificationType;
(function (NotificationType) {
    NotificationType["native"] = "native";
    NotificationType["inApp"] = "inApp";
})(NotificationType = exports.NotificationType || (exports.NotificationType = {}));
/**
 * The specification builder for the `snap_notify` permission.
 * `snap_notify` allows snaps to send multiple types of notifications to its users.
 *
 * @param options - The specification builder options.
 * @param options.allowedCaveats - The optional allowed caveats for the permission.
 * @param options.methodHooks - The RPC method hooks needed by the method implementation.
 * @returns The specification for the `snap_notify` permission.
 */
const specificationBuilder = ({ allowedCaveats = null, methodHooks }) => {
    return {
        permissionType: controllers_1.PermissionType.RestrictedMethod,
        targetKey: methodName,
        allowedCaveats,
        methodImplementation: getImplementation(methodHooks),
    };
};
exports.notifyBuilder = Object.freeze({
    targetKey: methodName,
    specificationBuilder,
    methodHooks: {
        showNativeNotification: true,
        showInAppNotification: true,
    },
});
/**
 * Builds the method implementation for `snap_notify`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.showNativeNotification - A function that shows a native browser notification.
 * @param hooks.showInAppNotification - A function that shows a notification in the MetaMask UI.
 * @returns The method implementation which returns `null` on success.
 * @throws If the params are invalid.
 */
function getImplementation({ showNativeNotification, showInAppNotification, }) {
    return async function implementation(args) {
        const { params, context: { origin }, } = args;
        const validatedParams = getValidatedParams(params);
        switch (validatedParams.type) {
            case NotificationType.native:
                return await showNativeNotification(origin, validatedParams);
            case NotificationType.inApp:
                return await showInAppNotification(origin, validatedParams);
            default:
                throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
                    message: 'Must specify a valid notification "type".',
                });
        }
    };
}
/**
 * Validates the notify method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated method parameter object.
 */
function getValidatedParams(params) {
    if (!Array.isArray(params) || !(0, utils_1.isObject)(params[0])) {
        throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
            message: 'Expected array params with single object.',
        });
    }
    const { type, message } = params[0];
    if (!type ||
        typeof type !== 'string' ||
        !Object.values(NotificationType).includes(type)) {
        throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
            message: 'Must specify a valid notification "type".',
        });
    }
    // Set to the max message length on a Mac notification for now.
    if (!message || typeof message !== 'string' || message.length >= 50) {
        throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
            message: 'Must specify a non-empty string "message" less than 50 characters long.',
        });
    }
    return params[0];
}
//# sourceMappingURL=notify.js.map