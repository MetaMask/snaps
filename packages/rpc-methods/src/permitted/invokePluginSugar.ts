import { JsonRpcRequest, JsonRpcEngineNextCallback, JsonRpcEngineEndCallback } from 'json-rpc-engine';
import { ethErrors } from 'eth-rpc-errors';
import { PLUGIN_PREFIX } from '@mm-snap/controllers';
import { PermittedHandlerExport } from '../../types';
import { isPlainObject } from '../utils';

export const invokePluginSugarHandler: PermittedHandlerExport<void, JsonRpcRequest<unknown>, unknown> = {
  methodNames: ['wallet_invokePlugin'],
  implementation: invokePluginSugar,
  methodDescription: 'Call an RPC method of the specified plugin.',
  hookNames: undefined,
};

async function invokePluginSugar(
  req: JsonRpcRequest<unknown>,
  _res: unknown,
  next: JsonRpcEngineNextCallback,
  end: JsonRpcEngineEndCallback,
): Promise<void> {
  if (
    !Array.isArray(req.params) ||
    typeof req.params[0] !== 'string' ||
    !isPlainObject(req.params[1])
  ) {
    return end(ethErrors.rpc.invalidParams({
      message: 'Must specify a string plugin ID and a plain request object.',
    }));
  }

  req.method = PLUGIN_PREFIX + req.params[0];
  req.params = [req.params[1]];
  return next();
}
