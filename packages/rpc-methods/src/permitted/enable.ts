import {
  JsonRpcRequest,
  PendingJsonRpcResponse,
  JsonRpcEngineEndCallback,
} from 'json-rpc-engine';
import { ethErrors, serializeError } from 'eth-rpc-errors';
import { IRequestedPermissions } from 'rpc-cap/dist/src/@types';
import { IOcapLdCapability } from 'rpc-cap/dist/src/@types/ocap-ld';
import { PLUGIN_PREFIX, PLUGIN_PREFIX_REGEX } from '@mm-snap/controllers';
import { PermittedHandlerExport } from '../../types';
import {
  handleInstallPlugins,
  InstallPluginsHook,
  InstallPluginsResult,
  preprocessRequestPermissions,
} from './common/pluginInstallation';

type SerializedEthereumRpcError = ReturnType<typeof serializeError>;

export interface EnableWalletResult {
  accounts: string[];
  permissions: IOcapLdCapability[];
  plugins: InstallPluginsResult;
  errors?: SerializedEthereumRpcError[];
}

export const enableWalletHandler: PermittedHandlerExport<
  EnableWalletHooks,
  [IRequestedPermissions],
  EnableWalletResult
> = {
  methodNames: ['wallet_enable'],
  implementation: enableWallet,
  methodDescription: 'Installs the requested plugins if they are permitted.',
  hookNames: {
    getAccounts: true,
    installPlugins: true,
    requestPermissions: true,
  },
};

export interface EnableWalletHooks {
  /**
   * @returns The permitted accounts for the requesting origin.
   */
  getAccounts: () => string[];

  /**
   * Installs the requested plugins if they are permitted.
   */
  installPlugins: InstallPluginsHook;

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
  { getAccounts, installPlugins, requestPermissions }: EnableWalletHooks,
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
    plugins: {},
  };

  // request the permissions

  let requestedPermissions: IRequestedPermissions;
  try {
    // we expect the params to be the same as wallet_requestPermissions
    requestedPermissions = await preprocessRequestPermissions(req.params[0]);
    result.permissions = await requestPermissions(requestedPermissions);
    if (!result.permissions || !result.permissions.length) {
      throw ethErrors.provider.userRejectedRequest({ data: req });
    }
  } catch (err) {
    return end(err);
  }

  // install plugins, if any

  // get the names of the approved plugins
  const requestedPlugins: IRequestedPermissions = result.permissions
    // requestPermissions returns all permissions for the domain,
    // so we're filtering out non-plugin and preexisting permissions
    .filter(
      (p) =>
        p.parentCapability.startsWith(PLUGIN_PREFIX) &&
        p.parentCapability in requestedPermissions,
    )
    // convert from namespaced permissions to plugin names
    .map((p) => p.parentCapability.replace(PLUGIN_PREFIX_REGEX, ''))
    .reduce((_requestedPlugins, pluginName) => {
      _requestedPlugins[pluginName] = {};
      return _requestedPlugins;
    }, {} as IRequestedPermissions);

  try {
    if (Object.keys(requestedPlugins).length > 0) {
      // this throws if requestedPlugins is empty
      result.plugins = await handleInstallPlugins(
        requestedPlugins,
        installPlugins,
      );
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
