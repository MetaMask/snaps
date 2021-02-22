import { PendingJsonRpcResponse, JsonRpcEngineEndCallback } from 'json-rpc-engine';
import { InstalledPlugins } from '@mm-snap/controllers';
import { PermittedHandlerExport } from '../../types';

const getPluginsExport: PermittedHandlerExport<GetPluginsHooks, void, InstalledPlugins> = {
  methodNames: ['wallet_getPlugins'],
  implementation: getPluginsHandler,
  methodDescription: 'Get requester\'s permitted and installed plugins.',
};
export default getPluginsExport;

export interface GetPluginsHooks {

  /**
   * @returns The permitted and installed plugins for the requesting origin.
   */
  getPlugins: () => InstalledPlugins;
}

async function getPluginsHandler(
  _req: unknown,
  res: PendingJsonRpcResponse<InstalledPlugins>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { getPlugins }: GetPluginsHooks,
): Promise<void> {
  // getPlugins is already bound to the origin
  res.result = getPlugins();
  return end();
}
