import { PermissionType, SubjectType } from '@metamask/permission-controller';
const methodName = 'snap_getLocale';
/**
 * The specification builder for the `snap_getLocale` permission.
 * `snap_getLocale` allows snaps to get the user selected locale.
 *
 * @param options - The specification builder options.
 * @param options.allowedCaveats - The optional allowed caveats for the permission.
 * @param options.methodHooks - The RPC method hooks needed by the method implementation.
 * @returns The specification for the `snap_getLocale` permission.
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
    getLocale: true
};
export const getLocaleBuilder = Object.freeze({
    targetName: methodName,
    specificationBuilder,
    methodHooks
});
/**
 * Builds the method implementation for `snap_getLocale`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.getLocale - A function that returns the user selected locale.
 * @returns The user selected locale.
 */ export function getImplementation({ getLocale }) {
    return async function implementation(_args) {
        return getLocale();
    };
}

//# sourceMappingURL=getLocale.js.map