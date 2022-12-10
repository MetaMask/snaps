import { RequestedPermissions, PermissionConstraint } from '@metamask/controllers';
import { PermittedHandlerExport } from '@metamask/types';
import { serializeError } from 'eth-rpc-errors';
import { InstallSnapsHook, InstallSnapsResult } from './common/snapInstallation';
declare type SerializedEthereumRpcError = ReturnType<typeof serializeError>;
export declare type EnableWalletResult = {
    accounts: string[];
    permissions: PermissionConstraint[];
    snaps: InstallSnapsResult;
    errors?: SerializedEthereumRpcError[];
};
/**
 * `wallet_enable` is a convenience method that takes a request permissions
 * object as its single parameter, and then calls `wallet_requestPermissions`,
 * `wallet_installSnaps`, and `eth_accounts` as appropriate based on the
 * requested permissions. The method returns a single object result with
 * separate properties for the return values of each method, and any errors
 * that occurred:
 *
 * `{ accounts, permissions, snaps, errors? }`
 */
export declare const enableWalletHandler: PermittedHandlerExport<EnableWalletHooks, [
    RequestedPermissions
], EnableWalletResult>;
export declare type EnableWalletHooks = {
    /**
     * @returns The permitted accounts for the requesting origin.
     */
    getAccounts: () => string[];
    /**
     * Installs the requested snaps if they are permitted.
     */
    installSnaps: InstallSnapsHook;
    /**
     * Initiates a permission request for the requesting origin.
     *
     * @returns The result of the permissions request.
     */
    requestPermissions: (permissions: RequestedPermissions) => Promise<PermissionConstraint[]>;
    /**
     * Gets the current permissions for the requesting origin.
     *
     * @returns The current permissions of the requesting origin.
     */
    getPermissions: () => Promise<Record<string, PermissionConstraint> | undefined>;
};
export {};
