import { getSessionScopes } from '@metamask/chain-agnostic-permission';
import type {
  JsonRpcEngineEndCallback,
  JsonRpcEngineNextCallback,
} from '@metamask/json-rpc-engine';
import type { RequestedPermissions } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import {
  isObject,
  type JsonRpcRequest,
  type PendingJsonRpcResponse,
} from '@metamask/utils';

export type CreateSessionHandlerHooks = {
  grantPermissions: (permissions: RequestedPermissions) => void;
};

/**
 * A handler that implements a simplified version of `wallet_createSession`.
 *
 * @param request - Incoming JSON-RPC request.
 * @param response - The outgoing JSON-RPC response, modified to return the
 * result.
 * @param _next - The `json-rpc-engine` middleware next handler.
 * @param end - The `json-rpc-engine` middleware end handler.
 * @param hooks - The method hooks.
 * @returns The JSON-RPC response.
 */
export async function createSessionHandler(
  request: JsonRpcRequest,
  response: PendingJsonRpcResponse,
  _next: JsonRpcEngineNextCallback,
  end: JsonRpcEngineEndCallback,
  hooks: CreateSessionHandlerHooks,
) {
  if (!isObject(request.params)) {
    return end(rpcErrors.invalidParams({ data: { request } }));
  }

  // TODO: Inject accounts
  const caveat = {
    requiredScopes: request.params.requiredScopes ?? {},
    optionalScopes: request.params.optionalScopes ?? {},
    sessionProperties: {},
    isMultichainOrigin: true,
  };

  const permissions = {
    'endowment:caip25': {
      caveats: [
        {
          type: 'authorizedScopes',
          value: caveat,
        },
      ],
    },
  };

  // @ts-expect-error Ignore for now.
  hooks.grantPermissions(permissions);

  // @ts-expect-error Ignore for now.
  const sessionScopes = getSessionScopes(caveat, {
    getNonEvmSupportedMethods: () => [],
  });

  response.result = { sessionScopes };
  return end();
}
