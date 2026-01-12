import {
  Caip25CaveatType,
  Caip25EndowmentPermissionName,
  setEthAccounts,
} from '@metamask/chain-agnostic-permission';
import type { RequestedPermissions } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import {
  array,
  is,
  object,
  string,
  optional,
  record,
} from '@metamask/superstruct';
import {
  CaipAccountIdStruct,
  CaipChainIdStruct,
  JsonStruct,
  type JsonRpcRequest,
} from '@metamask/utils';

import { getSessionScopes } from './utils';
import { getSimulationAccount } from '../internal-methods/accounts';

export type CreateSessionHandlerHooks = {
  grantPermissions: (permissions: RequestedPermissions) => void;
  getMnemonic: () => Promise<Uint8Array>;
};

const ScopesStruct = record(
  CaipChainIdStruct,
  object({
    methods: array(string()),
    accounts: array(CaipAccountIdStruct),
    notifications: array(string()),
  }),
);

const CreateSessionParamsStruct = object({
  requiredScopes: optional(ScopesStruct),
  optionalScopes: optional(ScopesStruct),
  sessionProperties: optional(record(string(), JsonStruct)),
});

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
  if (!is(request.params, CreateSessionParamsStruct)) {
    throw rpcErrors.invalidParams({ data: { request } });
  }

  const caveat = {
    requiredScopes: request.params.requiredScopes ?? {},
    optionalScopes: request.params.optionalScopes ?? {},
    sessionProperties: request.params.sessionProperties ?? {},
    isMultichainOrigin: true,
  };

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
