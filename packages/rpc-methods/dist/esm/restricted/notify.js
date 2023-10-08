import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { isObject } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';
const methodName = 'snap_notify';
export var NotificationType;
(function(NotificationType) {
    NotificationType["InApp"] = 'inApp';
    NotificationType["Native"] = 'native';
})(NotificationType || (NotificationType = {}));
/**
 * The specification builder for the `snap_notify` permission.
 * `snap_notify` allows snaps to send multiple types of notifications to its users.
 *
 * @param options - The specification builder options.
 * @param options.allowedCaveats - The optional allowed caveats for the permission.
 * @param options.methodHooks - The RPC method hooks needed by the method implementation.
 * @returns The specification for the `snap_notify` permission.
 */ export const specificationBuilder = ({ allowedCaveats = null, methodHooks })=>{
    return {
        permissionType: PermissionType.RestrictedMethod,
        targetName: methodName,
        allowedCaveats,
        methodImplementation: getImplementation(methodHooks),
        subjectTypes: [
            SubjectType.Snap
        ]
    };
};
const methodHooks = {
    showNativeNotification: true,
    showInAppNotification: true
};
export const notifyBuilder = Object.freeze({
    targetName: methodName,
    specificationBuilder,
    methodHooks
});
/**
 * Builds the method implementation for `snap_notify`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.showNativeNotification - A function that shows a native browser notification.
 * @param hooks.showInAppNotification - A function that shows a notification in the MetaMask UI.
 * @returns The method implementation which returns `null` on success.
 * @throws If the params are invalid.
 */ export function getImplementation({ showNativeNotification, showInAppNotification }) {
    return async function implementation(args) {
        const { params, context: { origin } } = args;
        const validatedParams = getValidatedParams(params);
        switch(validatedParams.type){
            case NotificationType.Native:
                return await showNativeNotification(origin, validatedParams);
            case NotificationType.InApp:
                return await showInAppNotification(origin, validatedParams);
            default:
                throw ethErrors.rpc.invalidParams({
                    message: 'Must specify a valid notification "type".'
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
 */ export function getValidatedParams(params) {
    if (!isObject(params)) {
        throw ethErrors.rpc.invalidParams({
            message: 'Expected params to be a single object.'
        });
    }
    const { type, message } = params;
    if (!type || typeof type !== 'string' || !Object.values(NotificationType).includes(type)) {
        throw ethErrors.rpc.invalidParams({
            message: 'Must specify a valid notification "type".'
        });
    }
    // Set to the max message length on a Mac notification for now.
    if (!message || typeof message !== 'string' || message.length >= 50) {
        throw ethErrors.rpc.invalidParams({
            message: 'Must specify a non-empty string "message" less than 50 characters long.'
        });
    }
    return params;
}

//# sourceMappingURL=notify.js.map