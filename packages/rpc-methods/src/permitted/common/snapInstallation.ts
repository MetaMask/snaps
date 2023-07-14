import type { RequestedPermissions } from '@metamask/permission-controller';
import type { InstallSnapsResult } from '@metamask/snaps-utils';
import { isObject } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';

export type { InstallSnapsResult } from '@metamask/snaps-utils';

export type InstallSnapsHook = (
  requestedSnaps: RequestedPermissions,
) => Promise<InstallSnapsResult>;

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
export async function handleInstallSnaps(
  requestedSnaps: RequestedPermissions,
  installSnaps: InstallSnapsHook,
): Promise<InstallSnapsResult> {
  if (!isObject(requestedSnaps)) {
    throw ethErrors.rpc.invalidParams({
      message: `Invalid snap installation params.`,
      data: { requestedSnaps },
    });
  } else if (Object.keys(requestedSnaps).length === 0) {
    throw ethErrors.rpc.invalidParams({
      message: `Must specify at least one snap to install.`,
      data: { requestedSnaps },
    });
  }

  // installSnaps is bound to the origin
  return await installSnaps(requestedSnaps);
}
