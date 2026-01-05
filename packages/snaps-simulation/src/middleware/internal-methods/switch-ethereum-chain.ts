import type {
  JsonRpcEngineEndCallback,
  JsonRpcEngineNextCallback,
} from '@metamask/json-rpc-engine';
import {
  assert,
  type Hex,
  type JsonRpcRequest,
  type PendingJsonRpcResponse,
} from '@metamask/utils';

export type SwitchEthereumChainHooks = {
  setCurrentChain: (chain: Hex) => null;
};

/**
 * A mock handler for the `wallet_switchEthereumChain` method that always
 * returns `null`.
 *
 * @param request - Incoming JSON-RPC request.
 * @param response - The outgoing JSON-RPC response, modified to return the
 * result.
 * @param _next - The `json-rpc-engine` middleware next handler.
 * @param end - The `json-rpc-engine` middleware end handler.
 * @param hooks - The method hooks.
 * @returns The response.
 */
export async function getSwitchEthereumChainHandler(
  request: JsonRpcRequest,
  response: PendingJsonRpcResponse,
  _next: JsonRpcEngineNextCallback,
  end: JsonRpcEngineEndCallback,
  hooks: SwitchEthereumChainHooks,
) {
  const castRequest = request as JsonRpcRequest<[{ chainId: Hex }]>;

  assert(castRequest.params?.[0]?.chainId, 'No chain ID passed.');
  hooks.setCurrentChain(castRequest.params[0].chainId);

  response.result = null;
  return end();
}
