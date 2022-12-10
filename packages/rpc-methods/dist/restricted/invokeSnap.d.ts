import { PermissionSpecificationBuilder, RestrictedMethodOptions, PermissionType } from '@metamask/controllers';
import { Json, NonEmptyArray } from '@metamask/utils';
import { Snap, SnapId, SnapRpcHookArgs } from '@metamask/snap-utils';
declare const targetKey: "wallet_snap_*";
export declare type InvokeSnapMethodHooks = {
    getSnap: (snapId: SnapId) => Snap | undefined;
    handleSnapRpcRequest: ({ snapId, origin, handler: handlerType, request, }: SnapRpcHookArgs & {
        snapId: SnapId;
    }) => Promise<unknown>;
};
declare type InvokeSnapSpecificationBuilderOptions = {
    allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
    methodHooks: InvokeSnapMethodHooks;
};
export declare const invokeSnapBuilder: Readonly<{
    readonly targetKey: "wallet_snap_*";
    readonly specificationBuilder: PermissionSpecificationBuilder<PermissionType.RestrictedMethod, InvokeSnapSpecificationBuilderOptions, {
        permissionType: PermissionType.RestrictedMethod;
        targetKey: typeof targetKey;
        methodImplementation: ReturnType<typeof getInvokeSnapImplementation>;
        allowedCaveats: Readonly<NonEmptyArray<string>> | null;
    }>;
    readonly methodHooks: {
        readonly getSnap: true;
        readonly handleSnapRpcRequest: true;
    };
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
export declare function getInvokeSnapImplementation({ getSnap, handleSnapRpcRequest, }: InvokeSnapMethodHooks): (options: RestrictedMethodOptions<[Record<string, Json>]>) => Promise<Json>;
export {};
