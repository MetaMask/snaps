import type {
  JsonRpcEngineEndCallback,
  JsonRpcEngineNextCallback,
} from '@metamask/json-rpc-engine';
import type {
  Json,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from '@metamask/utils';

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
 * @returns The JSON-RPC response.
 */
export async function getNetworkVersionHandler(
  _request: JsonRpcRequest,
  response: PendingJsonRpcResponse<Json>,
  _next: JsonRpcEngineNextCallback,
  end: JsonRpcEngineEndCallback,
) {
  // For now this will return a mocked result, this should probably match
  // whatever network the simulation is using.
  response.result = '0x01';

  return end();
}
