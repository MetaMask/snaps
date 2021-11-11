import {
  JsonRpcRequest,
  PendingJsonRpcResponse,
  JsonRpcEngineEndCallback,
} from 'json-rpc-engine';
import { ethErrors, serializeError } from 'eth-rpc-errors';
import { IRequestedPermissions } from 'rpc-cap/dist/src/@types';
import { IOcapLdCapability } from 'rpc-cap/dist/src/@types/ocap-ld';
import { SNAP_PREFIX, SNAP_PREFIX_REGEX } from '@metamask/snap-controllers';
import { PermittedHandlerExport } from '../../types';
import {
  handleInstallSnaps,
  InstallSnapsHook,
  InstallSnapsResult,
  preprocessRequestedPermissions,
} from './common/snapInstallation';

type SerializedEthereumRpcError = ReturnType<typeof serializeError>;

export interface EnableWalletResult {
  accounts: string[];
  permissions: IOcapLdCapability[];
  snaps: InstallSnapsResult;
  errors?: SerializedEthereumRpcError[];
}

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
  [IRequestedPermissions],
  EnableWalletResult
> = {
  methodNames: ['wallet_enable'],
  implementation: enableWallet,
  hookNames: {
    getAccounts: true,
    installSnaps: true,
    requestPermissions: true,
  },
};

export interface EnableWalletHooks {
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
   * @returns The result of the permissions request.
   */
  requestPermissions: (
    permissions: IRequestedPermissions,
  ) => Promise<IOcapLdCapability[]>;
}

async function enableWallet(
  req: JsonRpcRequest<[IRequestedPermissions]>,
  res: PendingJsonRpcResponse<EnableWalletResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { getAccounts, installSnaps, requestPermissions }: EnableWalletHooks,
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

  // request the permissions

  let requestedPermissions: IRequestedPermissions;
  try {
    // we expect the params to be the same as wallet_requestPermissions
    requestedPermissions = preprocessRequestedPermissions(req.params[0]);
    result.permissions = await requestPermissions(requestedPermissions);
    if (!result.permissions || !result.permissions.length) {
      throw ethErrors.provider.userRejectedRequest({ data: req });
    }
  } catch (err) {
    return end(err);
  }

  // install snaps, if any

  // get the names of the approved snaps
  const requestedSnaps: IRequestedPermissions = result.permissions
    // requestPermissions returns all permissions for the domain,
    // so we're filtering out non-snap and preexisting permissions
    .filter(
      (p) =>
        p.parentCapability.startsWith(SNAP_PREFIX) &&
        p.parentCapability in requestedPermissions,
    )
    // convert from namespaced permissions to snap names
    .map((p) => p.parentCapability.replace(SNAP_PREFIX_REGEX, ''))
    .reduce((_requestedSnaps, snapName) => {
      _requestedSnaps[snapName] = {};
      return _requestedSnaps;
    }, {} as IRequestedPermissions);

  try {
    if (Object.keys(requestedSnaps).length > 0) {
      // this throws if requestedSnaps is empty
      result.snaps = await handleInstallSnaps(requestedSnaps, installSnaps);
    }
  } catch (err) {
    if (!result.errors) {
      result.errors = [];
    }
    result.errors.push(serializeError(err));
  }

  // get whatever accounts we have
  result.accounts = await getAccounts();

  // return the result
  res.result = result;
  return end();
}
