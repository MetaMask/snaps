import { SubjectType, PermissionType } from '@metamask/permission-controller';
import { JsonStruct } from '@metamask/utils';
import { assert, string, object, union, array, record } from 'superstruct';
const SnapMessageStruct = union([
    object({
        method: string()
    }),
    object({
        method: string(),
        params: union([
            array(JsonStruct),
            record(string(), JsonStruct)
        ])
    })
]);
export const methodName = 'snap_manageAccounts';
/**
 * The specification builder for the `snap_manageAccounts` permission.
 * `snap_manageAccounts` lets the Snap manage a set of accounts via a custom keyring.
 *
 * @param options - The specification builder options.
 * @param options.allowedCaveats - The optional allowed caveats for the permission.
 * @param options.methodHooks - The RPC method hooks needed by the method implementation.
 * @returns The specification for the `snap_manageAccounts` permission.
 */ export const specificationBuilder = ({ allowedCaveats = null, methodHooks })=>{
    return {
        permissionType: PermissionType.RestrictedMethod,
        targetName: methodName,
        allowedCaveats,
        methodImplementation: manageAccountsImplementation(methodHooks),
        subjectTypes: [
            SubjectType.Snap
        ]
    };
};
/**
 * Builds the method implementation for `snap_manageAccounts`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.getSnapKeyring - A function to get the snap keyring.
 * @returns The method implementation which either returns `null` for a
 * successful state update/deletion or returns the decrypted state.
 * @throws If the params are invalid.
 */ export function manageAccountsImplementation({ getSnapKeyring }) {
    return async function manageAccounts(options) {
        const { context: { origin }, params } = options;
        assert(params, SnapMessageStruct);
        const keyring = await getSnapKeyring(origin);
        return await keyring.handleKeyringSnapMessage(origin, params);
    };
}
export const manageAccountsBuilder = Object.freeze({
    targetName: methodName,
    specificationBuilder,
    methodHooks: {
        getSnapKeyring: true
    }
});

//# sourceMappingURL=manageAccounts.js.map