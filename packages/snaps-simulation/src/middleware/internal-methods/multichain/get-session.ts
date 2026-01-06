import type {
  JsonRpcEngineEndCallback,
  JsonRpcEngineNextCallback,
} from '@metamask/json-rpc-engine';
import type { Caveat } from '@metamask/permission-controller';
import type {
  Json,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from '@metamask/utils';

export type GetSessionHandlerHooks = {
  getCaveat: (permission: string, caveatType: string) => Caveat<string, Json>;
};

/**
 * A handler that implements `wallet_getSession`.
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
export async function getSessionHandler(
  _request: JsonRpcRequest,
  response: PendingJsonRpcResponse,
  _next: JsonRpcEngineNextCallback,
  end: JsonRpcEngineEndCallback,
  hooks: GetSessionHandlerHooks,
) {
  response.result = hooks.getCaveat('endowment:caip25', 'authorizedScopes');
  return end();
}
