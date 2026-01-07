import {
  Caip25CaveatType,
  Caip25EndowmentPermissionName,
} from '@metamask/chain-agnostic-permission';
import type {
  JsonRpcEngineEndCallback,
  JsonRpcEngineNextCallback,
} from '@metamask/json-rpc-engine';
import type { Caveat } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import {
  type CaipChainId,
  isObject,
  type Json,
  type JsonRpcRequest,
  type PendingJsonRpcResponse,
} from '@metamask/utils';

export type InvokeMethodHandlerHooks = {
  getCaveat: (permission: string, caveatType: string) => Caveat<string, Json>;
};

/**
 * A handler that implements a simplified version of `wallet_invokeMethod`.
 *
 * @param request - Incoming JSON-RPC request.
 * @param _response - The outgoing JSON-RPC response. Ignored for this specific
 * handler.
 * @param next - The `json-rpc-engine` middleware next handler.
 * @param end - The `json-rpc-engine` middleware end handler.
 * @param hooks - The method hooks.
 * @returns The JSON-RPC response.
 */
export function invokeMethodHandler(
  request: JsonRpcRequest & { scope: CaipChainId },
  _response: PendingJsonRpcResponse,
  next: JsonRpcEngineNextCallback,
  end: JsonRpcEngineEndCallback,
  hooks: InvokeMethodHandlerHooks,
) {
  if (!isObject(request.params)) {
    return end(rpcErrors.invalidParams({ data: { request } }));
  }

  // TODO: Struct?
  const { request: wrappedRequest, scope } = request.params as any;

  hooks.getCaveat(Caip25EndowmentPermissionName, Caip25CaveatType);
  // TODO: Validate

  request.method = wrappedRequest.method;
  request.params = wrappedRequest.params;
  request.scope = scope;

  return next();
}
