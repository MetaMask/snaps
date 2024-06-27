import type { PermittedHandlerExport } from '@metamask/permission-controller';
import type { GetSnapsResult } from '@metamask/snaps-sdk';
import type { JsonRpcParams } from '@metamask/utils';
/**
 * `wallet_getSnaps` gets the requester's permitted and installed Snaps.
 */
export declare const getSnapsHandler: PermittedHandlerExport<GetSnapsHooks, JsonRpcParams, GetSnapsResult>;
export declare type GetSnapsHooks = {
    /**
     * @returns The permitted and installed snaps for the requesting origin.
     */
    getSnaps: () => Promise<GetSnapsResult>;
};
