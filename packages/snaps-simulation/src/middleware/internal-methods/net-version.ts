import type {
  JsonRpcEngineEndCallback,
  JsonRpcEngineNextCallback,
} from '@metamask/json-rpc-engine';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import type { InternalMethodsMiddlewareHooks } from './middleware';

/**
 * A mock handler for net_version that always returns a specific
 * hardcoded result.
 *
 * @param _request - Incoming JSON-RPC request. Ignored for this specific
 * handler.
 * @param response - The outgoing JSON-RPC response, modified to return the
 * result.
 * @param _next - The `json-rpc-engine` middleware next handler.
 * @param end - The `json-rpc-engine` middleware end handler.
 * @param hooks - The method hooks.
 * @returns The JSON-RPC response.
 */
export async function getNetworkVersionHandler(
  _request: JsonRpcRequest,
  response: PendingJsonRpcResponse,
  _next: JsonRpcEngineNextCallback,
  end: JsonRpcEngineEndCallback,
  hooks: Pick<InternalMethodsMiddlewareHooks, 'getSimulationState'>,
) {
  const hexChainId = hooks.getSimulationState().chain.chainId;
  response.result = BigInt(hexChainId).toString(10);

  return end();
}
