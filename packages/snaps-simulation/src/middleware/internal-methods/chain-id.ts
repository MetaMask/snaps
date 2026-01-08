import type {
  JsonRpcEngineEndCallback,
  JsonRpcEngineNextCallback,
} from '@metamask/json-rpc-engine';
import {
  bigIntToHex,
  parseCaipChainId,
  type CaipChainId,
  type JsonRpcRequest,
  type PendingJsonRpcResponse,
} from '@metamask/utils';

import type { InternalMethodsMiddlewareHooks } from './middleware';

/**
 * A mock handler for eth_chainId that always returns a specific
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
export async function getChainIdHandler(
  request: JsonRpcRequest & { scope?: CaipChainId },
  response: PendingJsonRpcResponse,
  _next: JsonRpcEngineNextCallback,
  end: JsonRpcEngineEndCallback,
  hooks: Pick<InternalMethodsMiddlewareHooks, 'getSimulationState'>,
) {
  const requestScope = request.scope && parseCaipChainId(request.scope);
  response.result = requestScope
    ? bigIntToHex(BigInt(requestScope.reference))
    : hooks.getSimulationState().chain.chainId;

  return end();
}
