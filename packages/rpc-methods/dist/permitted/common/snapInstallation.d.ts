import { RequestedPermissions } from '@metamask/controllers';
import { InstallSnapsResult } from '@metamask/snap-utils';
export { InstallSnapsResult } from '@metamask/snap-utils';
export declare type InstallSnapsHook = (requestedSnaps: RequestedPermissions) => Promise<InstallSnapsResult>;
/**
 * Preprocesses requested permissions to support `wallet_snap` syntactic sugar. This is done by
 * replacing instances of `wallet_snap` with `wallet_snap_${snapId}`.
 *
 * @param requestedPermissions - The existing permissions object.
 * @returns The modified permissions request.
 */
export declare function preprocessRequestedPermissions(requestedPermissions: RequestedPermissions): RequestedPermissions;
/**
 * Typechecks the requested snaps and passes them to the permissions
 * controller for installation.
 *
 * @param requestedSnaps - An object containing the requested snaps to be installed. The key of the
 * object is the snap id and the value is potential extra data, i.e. version.
 * @param installSnaps - A function that tries to install a given snap, prompting the user if
 * necessary.
 * @returns An object containing the installed snaps.
 * @throws If the params are invalid or the snap installation fails.
 */
export declare function handleInstallSnaps(requestedSnaps: RequestedPermissions, installSnaps: InstallSnapsHook): Promise<InstallSnapsResult>;
