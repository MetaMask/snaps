import type { Caip25CaveatValue } from '@metamask/chain-agnostic-permission';
import {
  Caip25CaveatType,
  Caip25EndowmentPermissionName,
  getSessionScopes,
} from '@metamask/chain-agnostic-permission';
import type { Caveat } from '@metamask/permission-controller';
import type { Json, JsonRpcRequest } from '@metamask/utils';

export type GetSessionHandlerHooks = {
  getCaveat: (
    permission: string,
    caveatType: string,
  ) => Caveat<string, Json> | undefined;
};

/**
 * A handler that implements a simplified version of `wallet_getSession`.
 *
 * @param _request - Incoming JSON-RPC request. Ignored for this specific
 * handler.
 * @param hooks - The method hooks.
 * @returns The JSON-RPC response.
 */
export function getSessionHandler(
  _request: JsonRpcRequest,
  hooks: GetSessionHandlerHooks,
) {
  const caveat = hooks.getCaveat(
    Caip25EndowmentPermissionName,
    Caip25CaveatType,
  ) as Caveat<string, Caip25CaveatValue>;

  const sessionScopes = caveat
    ? getSessionScopes(caveat.value, {
        getNonEvmSupportedMethods: () => [],
      })
    : {};

  return { sessionScopes };
}
