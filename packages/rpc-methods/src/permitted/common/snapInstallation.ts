import { ethErrors } from 'eth-rpc-errors';
import { SNAP_PREFIX, InstallSnapsResult } from '@metamask/snap-controllers';
import { IRequestedPermissions } from 'rpc-cap/dist/src/@types';
import { isPlainObject } from '../../utils';

export { InstallSnapsResult } from '@metamask/snap-controllers';

export type InstallSnapsHook = (
  requestedSnaps: IRequestedPermissions,
) => Promise<InstallSnapsResult>;

// preprocess requested permissions to support 'wallet_snap' syntactic sugar
export function preprocessRequestPermissions(
  requestedPermissions: IRequestedPermissions,
): IRequestedPermissions {
  if (!isPlainObject(requestedPermissions)) {
    throw ethErrors.rpc.invalidRequest({ data: { requestedPermissions } });
  }

  // passthrough if 'wallet_snap' is not requested
  if (!requestedPermissions.wallet_snap) {
    return requestedPermissions;
  }

  // rewrite permissions request parameter by destructuring snaps into
  // proper permissions prefixed with 'wallet_snap_'
  return Object.keys(requestedPermissions).reduce(
    (newRequestedPermissions, permName) => {
      if (permName === 'wallet_snap') {
        if (!isPlainObject(requestedPermissions[permName])) {
          throw ethErrors.rpc.invalidParams({
            message: `Invalid params to 'wallet_requestPermissions'`,
            data: { requestedPermissions },
          });
        }

        const requestedSnaps = requestedPermissions[
          permName
        ] as IRequestedPermissions;

        // destructure 'wallet_snap' object
        Object.keys(requestedSnaps).forEach((snapName) => {
          const snapKey = SNAP_PREFIX + snapName;

          // disallow requesting a snap X under 'wallet_snaps' and
          // directly as 'wallet_snap_X'
          if (requestedPermissions[snapKey]) {
            throw ethErrors.rpc.invalidParams({
              message: `Snap '${snapName}' requested both as direct permission and under 'wallet_snap'. We recommend using 'wallet_snap' only.`,
              data: { requestedPermissions },
            });
          }

          newRequestedPermissions[snapKey] = requestedSnaps[snapName];
        });
      } else {
        // otherwise, leave things as we found them
        newRequestedPermissions[permName] = requestedPermissions[permName];
      }

      return newRequestedPermissions;
    },
    {} as IRequestedPermissions,
  );
}

/**
 * Typechecks the requested snaps and passes them to the permissions
 * controller for installation.
 */
export async function handleInstallSnaps(
  requestedSnaps: IRequestedPermissions,
  installSnaps: InstallSnapsHook,
): Promise<InstallSnapsResult> {
  if (!isPlainObject(requestedSnaps)) {
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
