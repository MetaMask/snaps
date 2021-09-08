import {
  PendingJsonRpcResponse,
  JsonRpcEngineEndCallback,
} from 'json-rpc-engine';
import { InstallPluginsResult } from '@metamask/snap-controllers';
import { PermittedHandlerExport } from '../../types';

export const getPluginsHandler: PermittedHandlerExport<
  GetPluginsHooks,
  void,
  InstallPluginsResult
> = {
  methodNames: ['wallet_getPlugins'],
  implementation: getPluginsImplementation,
  methodDescription: "Get requester's permitted and installed plugins.",
  hookNames: {
    getPlugins: true,
  },
};

export interface GetPluginsHooks {
  /**
   * @returns The permitted and installed plugins for the requesting origin.
   */
  getPlugins: () => InstallPluginsResult;
}

async function getPluginsImplementation(
  _req: unknown,
  res: PendingJsonRpcResponse<InstallPluginsResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { getPlugins }: GetPluginsHooks,
): Promise<void> {
  // getPlugins is already bound to the origin
  res.result = getPlugins();
  return end();
}
