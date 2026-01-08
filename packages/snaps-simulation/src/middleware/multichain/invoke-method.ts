import type { Caip25CaveatValue } from '@metamask/chain-agnostic-permission';
import {
  Caip25CaveatType,
  Caip25EndowmentPermissionName,
} from '@metamask/chain-agnostic-permission';
import type { Caveat } from '@metamask/permission-controller';
import { providerErrors, rpcErrors } from '@metamask/rpc-errors';
import {
  type CaipChainId,
  isObject,
  type Json,
  type JsonRpcRequest,
} from '@metamask/utils';

import { getSessionScopes } from './utils';

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

  const caveat = hooks.getCaveat(
    Caip25EndowmentPermissionName,
    Caip25CaveatType,
  ) as Caveat<string, Caip25CaveatValue>;

  const sessionScopes = getSessionScopes(caveat.value);

  if (!sessionScopes[scope]?.methods.includes(wrappedRequest.method)) {
    throw providerErrors.unauthorized();
  }

  request.method = wrappedRequest.method;
  request.params = wrappedRequest.params;
  request.scope = scope;
}
