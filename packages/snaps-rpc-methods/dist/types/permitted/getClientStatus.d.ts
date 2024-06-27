import type { PermittedHandlerExport } from '@metamask/permission-controller';
import type { GetClientStatusResult } from '@metamask/snaps-sdk';
import type { JsonRpcParams } from '@metamask/utils';
/**
 * `snap_getClientStatus` returns useful information about the client running the snap.
 */
export declare const getClientStatusHandler: PermittedHandlerExport<GetClientStatusHooks, JsonRpcParams, GetClientStatusResult>;
export declare type GetClientStatusHooks = {
    /**
     * @returns Whether the client is locked or not.
     */
    getIsLocked: () => boolean;
};
