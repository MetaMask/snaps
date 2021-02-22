import { JsonRpcRequest, PendingJsonRpcResponse, JsonRpcEngineEndCallback } from 'json-rpc-engine';
import { ethErrors } from 'eth-rpc-errors';
import { IRequestedPermissions } from 'rpc-cap/dist/src/@types';
import { PermittedHandlerExport } from '../../types';
import { handleInstallPlugins, InstallPluginsHook, InstallPluginsResult } from './common/pluginInstallation';

const InstallPluginsExport: PermittedHandlerExport<InstallPluginsHooks, [IRequestedPermissions], InstallPluginsResult> = {
  methodNames: ['wallet_installPlugins'],
  implementation: installPluginsHandler,
  methodDescription: 'Installs the requested plugins if they are permitted.',
};
export default InstallPluginsExport;

export interface InstallPluginsHooks {

  /**
   * Installs the requested plugins if they are permitted.
   */
  installPlugins: InstallPluginsHook;
}

async function installPluginsHandler(
  req: JsonRpcRequest<[IRequestedPermissions]>,
  res: PendingJsonRpcResponse<InstallPluginsResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { installPlugins }: InstallPluginsHooks,
): Promise<void> {
  if (!Array.isArray(req.params)) {
    return (
      end(ethErrors.rpc.invalidParams({
        message: '"params" must be an array.',
      }))
    );
  }

  try {
    res.result = await handleInstallPlugins(req.params[0], installPlugins);
  } catch (err) {
    res.error = err;
  }
  return end();
}
