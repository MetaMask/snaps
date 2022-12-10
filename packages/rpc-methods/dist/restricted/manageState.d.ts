import { PermissionSpecificationBuilder, PermissionType, RestrictedMethodOptions } from '@metamask/controllers';
import { Json, NonEmptyArray } from '@metamask/utils';
declare const methodName = "snap_manageState";
export declare type ManageStateMethodHooks = {
    /**
     * A function that clears the state of the requesting Snap.
     */
    clearSnapState: (snapId: string) => Promise<void>;
    /**
     * A function that gets the state of the requesting Snap.
     *
     * @returns The current state of the Snap.
     */
    getSnapState: (snapId: string) => Promise<Record<string, Json>>;
    /**
     * A function that updates the state of the requesting Snap.
     *
     * @param newState - The new state of the Snap.
     */
    updateSnapState: (snapId: string, newState: Record<string, Json>) => Promise<void>;
};
declare type ManageStateSpecificationBuilderOptions = {
    allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
    methodHooks: ManageStateMethodHooks;
};
export declare const manageStateBuilder: Readonly<{
    readonly targetKey: "snap_manageState";
    readonly specificationBuilder: PermissionSpecificationBuilder<PermissionType.RestrictedMethod, ManageStateSpecificationBuilderOptions, {
        permissionType: PermissionType.RestrictedMethod;
        targetKey: typeof methodName;
        methodImplementation: ReturnType<typeof getManageStateImplementation>;
        allowedCaveats: Readonly<NonEmptyArray<string>> | null;
    }>;
    readonly methodHooks: {
        readonly clearSnapState: true;
        readonly getSnapState: true;
        readonly updateSnapState: true;
    };
}>;
export declare enum ManageStateOperation {
    clearState = "clear",
    getState = "get",
    updateState = "update"
}
export declare const STORAGE_SIZE_LIMIT = 104857600;
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
declare function getManageStateImplementation({ clearSnapState, getSnapState, updateSnapState, }: ManageStateMethodHooks): (options: RestrictedMethodOptions<[
    ManageStateOperation,
    Record<string, Json>
]>) => Promise<null | Record<string, Json>>;
export {};
