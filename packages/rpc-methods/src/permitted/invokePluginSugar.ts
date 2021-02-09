import { JsonRpcRequest, JsonRpcEngineNextCallback, JsonRpcEngineEndCallback } from 'json-rpc-engine';
import { ethErrors } from 'eth-rpc-errors';
import { PermittedHandlerExport } from '../../types';
import { isPlainObject } from '../utils';
import { PLUGIN_PREFIX } from '../../../controllers';

const InvokePluginSugarExport: PermittedHandlerExport<JsonRpcRequest<unknown>, unknown, void> = {
  methodNames: ['wallet_invokePlugin'],
  implementation: InvokePluginSugarHandler,
  methodDescription: 'Call an RPC method of the specified plugin.',
};
export default InvokePluginSugarExport;

async function InvokePluginSugarHandler(
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
