import type { Caip25CaveatValue } from '@metamask/chain-agnostic-permission';
import {
  Caip25CaveatType,
  Caip25EndowmentPermissionName,
} from '@metamask/chain-agnostic-permission';
import type { Caveat } from '@metamask/permission-controller';
import { providerErrors, rpcErrors } from '@metamask/rpc-errors';
import { isObject, type Json } from '@metamask/utils';

import type { ScopedJsonRpcRequest } from './utils';
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
  request: ScopedJsonRpcRequest,
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

  const sessionScopes = caveat ? getSessionScopes(caveat.value) : {};

  if (!sessionScopes[scope]?.methods.includes(wrappedRequest.method)) {
    throw providerErrors.unauthorized();
  }

  request.method = wrappedRequest.method;
  request.params = wrappedRequest.params;
  request.scope = scope;
}
