import type { PermissionSpecificationBuilder, RestrictedMethodOptions, PermissionValidatorConstraint, PermissionSideEffect } from '@metamask/permission-controller';
import { PermissionType } from '@metamask/permission-controller';
import type { Snap, SnapId, SnapRpcHookArgs, RequestedSnapPermissions, InstallSnapsResult } from '@metamask/snaps-utils';
import type { Json, NonEmptyArray } from '@metamask/utils';
import type { MethodHooksObject } from '../utils';
export declare const WALLET_SNAP_PERMISSION_KEY = "wallet_snap";
export declare type InstallSnaps = {
    type: `SnapController:install`;
    handler: (origin: string, requestedSnaps: RequestedSnapPermissions) => Promise<InstallSnapsResult>;
};
export declare type GetPermittedSnaps = {
    type: `SnapController:getPermitted`;
    handler: (origin: string) => InstallSnapsResult;
};
declare type AllowedActions = InstallSnaps | GetPermittedSnaps;
export declare type InvokeSnapMethodHooks = {
    getSnap: (snapId: SnapId) => Snap | undefined;
    handleSnapRpcRequest: ({ snapId, origin, handler, request, }: SnapRpcHookArgs & {
        snapId: SnapId;
    }) => Promise<unknown>;
};
declare type InvokeSnapSpecificationBuilderOptions = {
    allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
    methodHooks: InvokeSnapMethodHooks;
};
export declare type InvokeSnapParams = {
    snapId: string;
    request: Record<string, unknown>;
};
/**
 * The side-effect method to handle the snap install.
 *
 * @param params - The side-effect params.
 * @param params.requestData - The request data associated to the requested permission.
 * @param params.messagingSystem - The messenger to call an action.
 */
export declare const handleSnapInstall: PermissionSideEffect<AllowedActions, never>['onPermitted'];
export declare const invokeSnapBuilder: Readonly<{
    readonly targetName: "wallet_snap";
    readonly specificationBuilder: PermissionSpecificationBuilder<PermissionType.RestrictedMethod, InvokeSnapSpecificationBuilderOptions, {
        permissionType: PermissionType.RestrictedMethod;
        targetName: typeof WALLET_SNAP_PERMISSION_KEY;
        methodImplementation: ReturnType<typeof getInvokeSnapImplementation>;
        allowedCaveats: Readonly<NonEmptyArray<string>> | null;
        validator: PermissionValidatorConstraint;
        sideEffect: {
            onPermitted: PermissionSideEffect<AllowedActions, never>['onPermitted'];
        };
    }>;
    readonly methodHooks: MethodHooksObject<InvokeSnapMethodHooks>;
}>;
/**
 * Builds the method implementation for `wallet_snap_*`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.getSnap - A function that retrieves all information stored about a snap.
 * @param hooks.handleSnapRpcRequest - A function that sends an RPC request to a snap's RPC handler or throws if that fails.
 * @returns The method implementation which returns the result of `handleSnapRpcRequest`.
 * @throws If the params are invalid.
 */
export declare function getInvokeSnapImplementation({ getSnap, handleSnapRpcRequest, }: InvokeSnapMethodHooks): (options: RestrictedMethodOptions<Record<string, Json>>) => Promise<Json>;
export {};
