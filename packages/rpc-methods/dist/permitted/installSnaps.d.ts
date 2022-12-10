import { RequestedPermissions } from '@metamask/controllers';
import { PermittedHandlerExport } from '@metamask/types';
import { InstallSnapsHook, InstallSnapsResult } from './common/snapInstallation';
/**
 * `wallet_installSnaps` installs the requested Snaps, if they are permitted.
 */
export declare const installSnapsHandler: PermittedHandlerExport<InstallSnapsHooks, [
    RequestedPermissions
], InstallSnapsResult>;
export declare type InstallSnapsHooks = {
    /**
     * Installs the requested snaps if they are permitted.
     */
    installSnaps: InstallSnapsHook;
};
