import type { Caip25CaveatValue } from '@metamask/chain-agnostic-permission';
import {
  Caip25CaveatType,
  Caip25EndowmentPermissionName,
  setEthAccounts,
} from '@metamask/chain-agnostic-permission';
import type { RequestedPermissions } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import { isObject, type JsonRpcRequest } from '@metamask/utils';

import { getSessionScopes } from './utils';
import { getSimulationAccount } from '../internal-methods/accounts';

export type CreateSessionHandlerHooks = {
  grantPermissions: (permissions: RequestedPermissions) => void;
  getMnemonic: () => Promise<Uint8Array>;
};

/**
 * A handler that implements a simplified version of `wallet_createSession`.
 *
 * @param request - Incoming JSON-RPC request.
 * @param hooks - The method hooks.
 * @returns The JSON-RPC response.
 */
export async function createSessionHandler(
  request: JsonRpcRequest,
  hooks: CreateSessionHandlerHooks,
) {
  if (!isObject(request.params)) {
    throw rpcErrors.invalidParams({ data: { request } });
  }

  const caveat = {
    requiredScopes: request.params.requiredScopes ?? {},
    optionalScopes: request.params.optionalScopes ?? {},
    sessionProperties: {},
    isMultichainOrigin: true,
  } as Caip25CaveatValue;

  const mnemonic = await hooks.getMnemonic();
  const ethereumAccounts = [await getSimulationAccount(mnemonic)];

  const caveatWithAccounts = setEthAccounts(caveat, ethereumAccounts);

  const permissions = {
    [Caip25EndowmentPermissionName]: {
      caveats: [
        {
          type: Caip25CaveatType,
          value: caveatWithAccounts,
        },
      ],
    },
  } as RequestedPermissions;

  hooks.grantPermissions(permissions);

  const sessionScopes = getSessionScopes(caveatWithAccounts);

  return { sessionScopes, sessionProperties: caveat.sessionProperties };
}
