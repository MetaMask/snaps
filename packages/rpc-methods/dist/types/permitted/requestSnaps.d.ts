import type { PermissionConstraint, RequestedPermissions } from '@metamask/permission-controller';
import type { SnapsPermissionRequest } from '@metamask/snaps-utils';
import type { PermittedHandlerExport } from '@metamask/types';
import type { InstallSnapsHook, InstallSnapsResult } from './common/snapInstallation';
/**
 * `wallet_requestSnaps` installs the requested Snaps and requests permission to use them if necessary.
 */
export declare const requestSnapsHandler: PermittedHandlerExport<RequestSnapsHooks, RequestedPermissions, InstallSnapsResult>;
export declare type RequestSnapsHooks = {
    /**
     * Installs the requested snaps if they are permitted.
     */
    installSnaps: InstallSnapsHook;
    /**
     * Initiates a permission request for the requesting origin.
     *
     * @returns The result of the permissions request.
     */
    requestPermissions: (permissions: RequestedPermissions) => Promise<[
        Record<string, PermissionConstraint>,
        {
            data: Record<string, unknown>;
            id: string;
            origin: string;
        }
    ]>;
    /**
     * Gets the current permissions for the requesting origin.
     *
     * @returns The current permissions of the requesting origin.
     */
    getPermissions: () => Promise<Record<string, PermissionConstraint> | undefined>;
};
/**
 * Checks whether an origin has existing `wallet_snap` permission and
 * whether or not it has the requested snapIds caveat.
 *
 * @param existingPermissions - The existing permissions for the origin.
 * @param requestedSnaps - The requested snaps.
 * @returns True if the existing permissions satisfy the requested snaps, otherwise false.
 */
export declare function hasRequestedSnaps(existingPermissions: Record<string, PermissionConstraint>, requestedSnaps: Record<string, unknown>): boolean;
/**
 * Constructs a valid permission request with merged caveats based on existing permissions
 * and the requested snaps.
 *
 * @param existingPermissions - The existing permissions for the origin.
 * @param requestedPermissions - The permission request passed into `requestPermissions`.
 * @returns `requestedPermissions`.
 */
export declare function getSnapPermissionsRequest(existingPermissions: Record<string, PermissionConstraint>, requestedPermissions: unknown): SnapsPermissionRequest;
