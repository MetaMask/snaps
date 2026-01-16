import { Caip25EndowmentPermissionName } from '@metamask/chain-agnostic-permission';
import { type JsonRpcRequest } from '@metamask/utils';

export type RevokeSessionHandlerHooks = {
  revokePermission: (permissionName: string) => void;
};

/**
 * A handler that implements a simplified version of `wallet_revokeSession`.
 *
 * @param _request - Incoming JSON-RPC request. Unused for this handler.
 * @param hooks - The method hooks.
 * @returns The JSON-RPC response.
 */
export function revokeSessionHandler(
  _request: JsonRpcRequest,
  hooks: RevokeSessionHandlerHooks,
) {
  hooks.revokePermission(Caip25EndowmentPermissionName);
  return true;
}
