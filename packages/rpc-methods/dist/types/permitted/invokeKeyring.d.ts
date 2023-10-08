import type { Snap } from '@metamask/snaps-utils';
import { type SnapId, type SnapRpcHookArgs } from '@metamask/snaps-utils';
import type { PermittedHandlerExport, JsonRpcRequest } from '@metamask/types';
/**
 * `wallet_invokeKeyring` gets the requester's permitted and installed Snaps.
 */
export declare const invokeKeyringHandler: PermittedHandlerExport<InvokeKeyringHooks, JsonRpcRequest<unknown>, unknown>;
export declare type InvokeKeyringHooks = {
    hasPermission: (origin: string, permissionName: string) => boolean;
    handleSnapRpcRequest: ({ snapId, origin, handler, request, }: SnapRpcHookArgs & {
        snapId: SnapId;
    }) => Promise<unknown>;
    getSnap: (snapId: SnapId) => Snap | undefined;
    getAllowedKeyringMethods: (origin: string) => string[];
};
