import {
  RequestedPermissions,
  PermissionConstraint,
} from '@metamask/controllers';
import { SNAP_PREFIX_REGEX } from '@metamask/snap-controllers';
import {
  PermittedHandlerExport,
  JsonRpcRequest,
  PendingJsonRpcResponse,
  JsonRpcEngineEndCallback,
} from '@metamask/types';
import { hasProperty } from '@metamask/utils';
import { ethErrors, serializeError } from 'eth-rpc-errors';
import { SNAP_PREFIX } from '@metamask/snap-utils';
import {
  handleInstallSnaps,
  InstallSnapsHook,
  InstallSnapsResult,
  preprocessRequestedPermissions,
} from './common/snapInstallation';

type SerializedEthereumRpcError = ReturnType<typeof serializeError>;

export type EnableWalletResult = {
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
export const enableWalletHandler: PermittedHandlerExport<
  EnableWalletHooks,
  [RequestedPermissions],
  EnableWalletResult
> = {
  methodNames: ['wallet_enable'],
  implementation: enableWallet,
  hookNames: {
    getAccounts: true,
    installSnaps: true,
    requestPermissions: true,
    getPermissions: true,
  },
};

export type EnableWalletHooks = {
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
 * The `wallet_enable` method implementation. See {@link enableWalletHandler}
 * for more information.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.getAccounts - Gets the user's Ethereum account addresses.
 * @param hooks.installSnaps - A function that installs permitted snaps.
 * @param hooks.requestPermissions - A function that requests permissions on
 * behalf of a subject.
 * @param hooks.getPermissions - A function that gets the current permissions
 * of a subject.
 * @returns Nothing.
 */
async function enableWallet(
  req: JsonRpcRequest<[RequestedPermissions]>,
  res: PendingJsonRpcResponse<EnableWalletResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  {
    getAccounts,
    installSnaps,
    requestPermissions,
    getPermissions,
  }: EnableWalletHooks,
): Promise<void> {
  if (!Array.isArray(req.params)) {
    return end(
      ethErrors.rpc.invalidParams({
        message: '"params" must be an array.',
      }),
    );
  }

  const result: EnableWalletResult = {
    accounts: [],
    permissions: [],
    snaps: {},
  };

  // Request the permissions

  let requestedPermissions: RequestedPermissions;
  try {
    // We expect the params to be the same as wallet_requestPermissions
    requestedPermissions = preprocessRequestedPermissions(req.params[0]);
    const existingPermissions = await getPermissions();
    if (
      existingPermissions &&
      hasPermissions(existingPermissions, requestedPermissions)
    ) {
      result.permissions = Object.values(existingPermissions);
    } else {
      result.permissions = await requestPermissions(requestedPermissions);
    }

    if (!result.permissions || !result.permissions.length) {
      throw ethErrors.provider.userRejectedRequest({ data: req });
    }
  } catch (err) {
    return end(err);
  }

  // Install snaps, if any

  // Get the names of the approved snaps
  const requestedSnaps: RequestedPermissions = result.permissions
    // RequestPermissions returns all permissions for the domain,
    // so we're filtering out non-snap and preexisting permissions
    .filter(
      (perm) =>
        perm.parentCapability.startsWith(SNAP_PREFIX) &&
        perm.parentCapability in requestedPermissions,
    )
    // Convert from namespaced permissions to snap ids
    .reduce((_requestedSnaps, perm) => {
      const snapId = perm.parentCapability.replace(SNAP_PREFIX_REGEX, '');
      _requestedSnaps[snapId] = requestedPermissions[perm.parentCapability];
      return _requestedSnaps;
    }, {} as RequestedPermissions);

  try {
    if (Object.keys(requestedSnaps).length > 0) {
      // This throws if requestedSnaps is empty
      result.snaps = await handleInstallSnaps(requestedSnaps, installSnaps);
    }
  } catch (err) {
    if (!result.errors) {
      result.errors = [];
    }
    result.errors.push(serializeError(err));
  }

  // Get whatever accounts we have
  result.accounts = await getAccounts();

  // Return the result
  res.result = result;
  return end();
}
