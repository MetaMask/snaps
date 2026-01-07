import {
  Caip25CaveatType,
  Caip25EndowmentPermissionName,
} from '@metamask/chain-agnostic-permission';
import type { Caveat } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import {
  type CaipChainId,
  isObject,
  type Json,
  type JsonRpcRequest,
} from '@metamask/utils';

export type InvokeMethodHandlerHooks = {
  getCaveat: (
    permission: string,
    caveatType: string,
  ) => Caveat<string, Json> | undefined;
};

/**
 * A handler that implements a simplified version of `wallet_invokeMethod`.
 *
 * @param request - Incoming JSON-RPC request.
 * @param hooks - The method hooks.
 * @returns Nothing.
 */
export async function invokeMethodHandler(
  request: JsonRpcRequest & { scope: CaipChainId },
  hooks: InvokeMethodHandlerHooks,
) {
  if (!isObject(request.params)) {
    throw rpcErrors.invalidParams({ data: { request } });
  }

  // TODO: Struct?
  const { request: wrappedRequest, scope } = request.params as any;

  hooks.getCaveat(Caip25EndowmentPermissionName, Caip25CaveatType);
  // TODO: Validate

  request.method = wrappedRequest.method;
  request.params = wrappedRequest.params;
  request.scope = scope;
}
