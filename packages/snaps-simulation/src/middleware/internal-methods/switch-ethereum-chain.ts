import type {
  JsonRpcEngineEndCallback,
  JsonRpcEngineNextCallback,
} from '@metamask/json-rpc-engine';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

/**
 * A mock handler for the `wallet_switchEthereumChain` method that always
 * returns `null`.
 *
 * @param _request - Incoming JSON-RPC request. This is ignored for this
 * specific handler.
 * @param response - The outgoing JSON-RPC response, modified to return the
 * result.
 * @param _next - The `json-rpc-engine` middleware next handler.
 * @param end - The `json-rpc-engine` middleware end handler.
 * @returns The response.
 */
export async function getSwitchEthereumChainHandler(
  _request: JsonRpcRequest,
  response: PendingJsonRpcResponse,
  _next: JsonRpcEngineNextCallback,
  end: JsonRpcEngineEndCallback,
) {
  response.result = null;
  return end();
}
