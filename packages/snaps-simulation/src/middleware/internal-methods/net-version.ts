import type {
  JsonRpcEngineEndCallback,
  JsonRpcEngineNextCallback,
} from '@metamask/json-rpc-engine';
import { hexToBigInt, parseCaipChainId } from '@metamask/utils';
import type { PendingJsonRpcResponse } from '@metamask/utils';

import type { InternalMethodsMiddlewareHooks } from './middleware';
import type { ScopedJsonRpcRequest } from '../multichain';

/**
 * A mock handler for net_version that always returns a specific
 * hardcoded result.
 *
 * @param request - Incoming JSON-RPC request.
 * @param response - The outgoing JSON-RPC response, modified to return the
 * result.
 * @param _next - The `json-rpc-engine` middleware next handler.
 * @param end - The `json-rpc-engine` middleware end handler.
 * @param hooks - The method hooks.
 * @returns The JSON-RPC response.
 */
export async function getNetworkVersionHandler(
  request: ScopedJsonRpcRequest,
  response: PendingJsonRpcResponse,
  _next: JsonRpcEngineNextCallback,
  end: JsonRpcEngineEndCallback,
  hooks: Pick<InternalMethodsMiddlewareHooks, 'getSimulationState'>,
) {
  const requestScope = request.scope && parseCaipChainId(request.scope);
  response.result = requestScope
    ? BigInt(requestScope.reference).toString(10)
    : hexToBigInt(hooks.getSimulationState().chain.chainId).toString(10);

  return end();
}
