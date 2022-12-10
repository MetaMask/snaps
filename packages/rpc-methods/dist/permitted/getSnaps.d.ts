import { InstallSnapsResult } from '@metamask/snap-utils';
import { PermittedHandlerExport } from '@metamask/types';
/**
 * `wallet_getSnaps` gets the requester's permitted and installed Snaps.
 */
export declare const getSnapsHandler: PermittedHandlerExport<GetSnapsHooks, void, InstallSnapsResult>;
export declare type GetSnapsHooks = {
    /**
     * @returns The permitted and installed snaps for the requesting origin.
     */
    getSnaps: () => Promise<InstallSnapsResult>;
};
