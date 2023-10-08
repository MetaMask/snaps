import type { RequestedPermissions } from '@metamask/permission-controller';
import type { InstallSnapsResult } from '@metamask/snaps-utils';
export type { InstallSnapsResult } from '@metamask/snaps-utils';
export declare type InstallSnapsHook = (requestedSnaps: RequestedPermissions) => Promise<InstallSnapsResult>;
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
