import { JsonRpcEngineEndCallback, JsonRpcRequest, PendingJsonRpcResponse } from 'json-rpc-engine';
import { ethErrors } from 'eth-rpc-errors';
import { AnnotatedJsonRpcEngine } from 'rpc-cap';
import { PLUGIN_PREFIX, PluginController } from '../../../controllers';
import { RestrictedHandlerExport } from '../../types';
import { isPlainObject } from '../utils';

const invokePluginExport: RestrictedHandlerExport<[Record<string, unknown>], unknown, InvokePluginHooks> = {
  methodNames: [`${PLUGIN_PREFIX}*`],
  implementationGetter: invokePluginHandlerGetter,
  permissionDescription: 'Connect to plugin $1, and install it if not available yet.',
  methodDescription: 'Call an RPC method of the specified plugin.',
};
export default invokePluginExport;

export interface InvokePluginHooks {

  getPlugin: PluginController['get'];
  addPlugin: PluginController['add'];
  getPluginRpcHandler: PluginController['getRpcMessageHandler'];
}

function invokePluginHandlerGetter({ getPlugin, addPlugin, getPluginRpcHandler }: InvokePluginHooks) {
  return async function invokePluginHandler(
    req: JsonRpcRequest<[Record<string, unknown>]>,
    res: PendingJsonRpcResponse<unknown>,
    _next: unknown,
    end: JsonRpcEngineEndCallback,
    engine: AnnotatedJsonRpcEngine,
  ): Promise<void> {
    try {
      const pluginRpcRequest = req.params?.[0];
      if (!isPlainObject(pluginRpcRequest)) {
        return end(ethErrors.rpc.invalidParams({
          message: 'Must specify plugin RPC request object as single parameter.',
        }));
      }

      const pluginOriginString = req.method.substr(PLUGIN_PREFIX.length);

      if (!getPlugin(pluginOriginString)) {
        await addPlugin(pluginOriginString);
      }

      const handler = getPluginRpcHandler(pluginOriginString);
      if (!handler) {
        return end(ethErrors.rpc.methodNotFound({
          message: `Plugin RPC message handler not found for plugin "${pluginOriginString}".`,
        }));
      }

      const requestor = engine.domain;

      // Handler is an async function that takes an pluginOriginString string and a request object.
      // It should return the result it would like returned to the requestor as part of response.result
      res.result = await handler(requestor as string, pluginRpcRequest);
      return end();
    } catch (err) {
      return end(err);
    }
  };
}
