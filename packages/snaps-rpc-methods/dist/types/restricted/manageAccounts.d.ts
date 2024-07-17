import type { RestrictedMethodOptions, ValidPermissionSpecification, PermissionSpecificationBuilder } from '@metamask/permission-controller';
import { PermissionType } from '@metamask/permission-controller';
import type { ManageAccountsParams, ManageAccountsResult } from '@metamask/snaps-sdk';
import type { InferMatching } from '@metamask/snaps-utils';
import type { Json, NonEmptyArray } from '@metamask/utils';
declare const SnapMessageStruct: import("@metamask/superstruct").Struct<{
    method: string;
} | {
    method: string;
    params: Record<string, Json> | Json[];
}, null>;
declare type Message = InferMatching<typeof SnapMessageStruct, ManageAccountsParams>;
export declare const methodName = "snap_manageAccounts";
export declare type ManageAccountsMethodHooks = {
    /**
     * Gets the snap keyring implementation.
     */
    getSnapKeyring: (snapOrigin: string) => Promise<{
        handleKeyringSnapMessage: (snapId: string, message: Message) => Promise<Json>;
    }>;
};
declare type ManageAccountsSpecificationBuilderOptions = {
    allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
    methodHooks: ManageAccountsMethodHooks;
};
declare type ManageAccountsSpecification = ValidPermissionSpecification<{
    permissionType: PermissionType.RestrictedMethod;
    targetName: typeof methodName;
    methodImplementation: ReturnType<typeof manageAccountsImplementation>;
    allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;
/**
 * The specification builder for the `snap_manageAccounts` permission.
 * `snap_manageAccounts` lets the Snap manage a set of accounts via a custom keyring.
 *
 * @param options - The specification builder options.
 * @param options.allowedCaveats - The optional allowed caveats for the permission.
 * @param options.methodHooks - The RPC method hooks needed by the method implementation.
 * @returns The specification for the `snap_manageAccounts` permission.
 */
export declare const specificationBuilder: PermissionSpecificationBuilder<PermissionType.RestrictedMethod, ManageAccountsSpecificationBuilderOptions, ManageAccountsSpecification>;
/**
 * Builds the method implementation for `snap_manageAccounts`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.getSnapKeyring - A function to get the snap keyring.
 * @returns The method implementation which either returns `null` for a
 * successful state update/deletion or returns the decrypted state.
 * @throws If the params are invalid.
 */
export declare function manageAccountsImplementation({ getSnapKeyring, }: ManageAccountsMethodHooks): (options: RestrictedMethodOptions<ManageAccountsParams>) => Promise<ManageAccountsResult>;
export declare const manageAccountsBuilder: Readonly<{
    readonly targetName: "snap_manageAccounts";
    readonly specificationBuilder: PermissionSpecificationBuilder<PermissionType.RestrictedMethod, ManageAccountsSpecificationBuilderOptions, {
        permissionType: PermissionType.RestrictedMethod;
        targetName: typeof methodName;
        methodImplementation: ReturnType<typeof manageAccountsImplementation>;
        allowedCaveats: Readonly<NonEmptyArray<string>> | null;
    }>;
    readonly methodHooks: {
        readonly getSnapKeyring: true;
    };
}>;
export {};
