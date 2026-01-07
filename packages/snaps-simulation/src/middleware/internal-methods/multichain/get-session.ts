import {
  Caip25CaveatType,
  Caip25EndowmentPermissionName,
} from '@metamask/chain-agnostic-permission';
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
 * A handler that implements a simplified version of `wallet_getSession`.
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
  try {
    const caveat = hooks.getCaveat(
      Caip25EndowmentPermissionName,
      Caip25CaveatType,
    );
    response.result = { sessionScopes: caveat?.value ?? {} };
  } catch {
    response.result = { sessionScopes: {} };
  }
  return end();
}
