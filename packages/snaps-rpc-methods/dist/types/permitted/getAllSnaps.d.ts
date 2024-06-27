import type { PermittedHandlerExport } from '@metamask/permission-controller';
import type { GetSnapsResult } from '@metamask/snaps-sdk';
import type { JsonRpcParams } from '@metamask/utils';
/**
 * `wallet_getAllSnaps` gets all installed Snaps. Currently, this can only be
 * called from `https://snaps.metamask.io`.
 */
export declare const getAllSnapsHandler: PermittedHandlerExport<GetAllSnapsHooks, JsonRpcParams, GetSnapsResult>;
export declare type GetAllSnapsHooks = {
    /**
     * @returns All installed Snaps.
     */
    getAllSnaps: () => Promise<GetSnapsResult>;
};
