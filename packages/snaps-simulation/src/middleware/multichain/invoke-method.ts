import type { Caip25CaveatValue } from '@metamask/chain-agnostic-permission';
import {
  Caip25CaveatType,
  Caip25EndowmentPermissionName,
} from '@metamask/chain-agnostic-permission';
import type { Caveat } from '@metamask/permission-controller';
import { providerErrors, rpcErrors } from '@metamask/rpc-errors';
import { is, object, pick } from '@metamask/superstruct';
import {
  CaipChainIdStruct,
  JsonRpcRequestStruct,
  type Json,
} from '@metamask/utils';

import type { ScopedJsonRpcRequest } from './utils';
import { getSessionScopes } from './utils';

export type InvokeMethodHandlerHooks = {
  getCaveat: (
    permission: string,
    caveatType: string,
  ) => Caveat<string, Json> | undefined;
};

const InvokeMethodParamsStruct = object({
  scope: CaipChainIdStruct,
  // @ts-expect-error Unsure why this type doesn't work.
  request: pick(JsonRpcRequestStruct, ['method', 'params']),
});

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
  if (!is(request.params, InvokeMethodParamsStruct)) {
    throw rpcErrors.invalidParams({ data: { request } });
  }

  const { request: wrappedRequest, scope } = request.params;

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
