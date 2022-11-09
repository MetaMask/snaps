import { ethErrors } from 'eth-rpc-errors';
import {
  PermissionConstraint,
  RequestedPermissions,
} from '@metamask/controllers';
import {
  PermittedHandlerExport,
  JsonRpcRequest,
  PendingJsonRpcResponse,
  JsonRpcEngineEndCallback,
} from '@metamask/types';
import { getSnapPermissionName } from '@metamask/snap-utils';
import { hasProperty, isObject } from '@metamask/utils';
import {
  handleInstallSnaps,
  InstallSnapsHook,
  InstallSnapsResult,
} from './common/snapInstallation';

/**
 * `wallet_requestSnaps` installs the requested Snaps and requests permission to use them if necessary.
 */
export const requestSnapsHandler: PermittedHandlerExport<
  RequestSnapsHooks,
  RequestedPermissions,
  InstallSnapsResult
> = {
  methodNames: ['wallet_requestSnaps'],
  implementation: requestSnapsImplementation,
  hookNames: {
    installSnaps: true,
    requestPermissions: true,
    getPermissions: true,
  },
};

export type RequestSnapsHooks = {
  /**
   * Installs the requested snaps if they are permitted.
   */
  installSnaps: InstallSnapsHook;

  /**
   * Initiates a permission request for the requesting origin.
   *
   * @returns The result of the permissions request.
   */
  requestPermissions: (
    permissions: RequestedPermissions,
  ) => Promise<PermissionConstraint[]>;

  /**
   * Gets the current permissions for the requesting origin.
   *
   * @returns The current permissions of the requesting origin.
   */
  getPermissions: () => Promise<
    Record<string, PermissionConstraint> | undefined
  >;
};

/**
 * Checks whether existing permissions satisfy the requested permissions
 *
 * Note: Currently, we don't compare caveats, if any caveats are requested, we always return false.
 *
 * @param existingPermissions - The existing permissions for the origin.
 * @param requestedPermissions - The requested permissions for the origin.
 * @returns True if the existing permissions satisfy the requested permissions, otherwise false.
 */
function hasPermissions(
  existingPermissions: Record<string, PermissionConstraint>,
  requestedPermissions: RequestedPermissions,
): boolean {
  return Object.entries(requestedPermissions).every(
    ([target, requestedPermission]) => {
      if (
        requestedPermission?.caveats &&
        requestedPermission.caveats.length > 0
      ) {
        return false;
      }

      return hasProperty(existingPermissions, target);
    },
  );
}

/**
 * The `wallet_requestSnaps` method implementation.
 * Tries to install the requested snaps and adds them to the JSON-RPC response.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.installSnaps - A function that tries to install a given snap, prompting the user if necessary.
 * @param hooks.requestPermissions - A function that requests permissions on
 * behalf of a subject.
 * @param hooks.getPermissions - A function that gets the current permissions.
 * @returns A promise that resolves once the JSON-RPC response has been modified.
 * @throws If the params are invalid.
 */
async function requestSnapsImplementation(
  req: JsonRpcRequest<RequestedPermissions>,
  res: PendingJsonRpcResponse<InstallSnapsResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { installSnaps, requestPermissions, getPermissions }: RequestSnapsHooks,
): Promise<void> {
  const requestedSnaps = req.params;
  if (!isObject(requestedSnaps)) {
    return end(
      ethErrors.rpc.invalidParams({
        message: '"params" must be an object.',
      }),
    );
  }

  // Request the permission for the installing DApp to talk to the snap, if needed
  // TODO: Should this be part of the install flow?

  try {
    // We expect the params to be the same as wallet_requestPermissions
    const requestedPermissions = Object.keys(requestedSnaps).reduce<
      Record<string, Partial<PermissionConstraint>>
    >((acc, key) => {
      acc[getSnapPermissionName(key)] = requestedSnaps[key];
      return acc;
    }, {});
    const existingPermissions = await getPermissions();
    if (
      !existingPermissions ||
      !hasPermissions(existingPermissions, requestedPermissions)
    ) {
      const approvedPermissions = await requestPermissions(
        requestedPermissions,
      );

      if (!approvedPermissions || !approvedPermissions.length) {
        throw ethErrors.provider.userRejectedRequest({ data: req });
      }
    }
  } catch (err) {
    return end(err);
  }

  try {
    res.result = await handleInstallSnaps(requestedSnaps, installSnaps);
  } catch (err) {
    res.error = err;
  }
  return end();
}
