import type { PermittedHandlerExport } from '@metamask/permission-controller';
import type { InvokeKeyringResult, InvokeSnapParams } from '@metamask/snaps-sdk';
import type { Snap, SnapRpcHookArgs } from '@metamask/snaps-utils';
/**
 * `wallet_invokeKeyring` gets the requester's permitted and installed Snaps.
 */
export declare const invokeKeyringHandler: PermittedHandlerExport<InvokeKeyringHooks, InvokeSnapParams, InvokeKeyringResult>;
export declare type InvokeKeyringHooks = {
    hasPermission: (permissionName: string) => boolean;
    handleSnapRpcRequest: ({ snapId, handler, request, }: Omit<SnapRpcHookArgs, 'origin'> & {
        snapId: string;
    }) => Promise<unknown>;
    getSnap: (snapId: string) => Snap | undefined;
    getAllowedKeyringMethods: () => string[];
};
