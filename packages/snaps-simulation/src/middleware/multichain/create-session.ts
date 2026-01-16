import {
  Caip25CaveatType,
  Caip25EndowmentPermissionName,
  setNonSCACaipAccountIdsInCaip25CaveatValue,
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
  type CaipAccountId,
  CaipAccountIdStruct,
  CaipChainIdStruct,
  JsonStruct,
  type JsonRpcRequest,
} from '@metamask/utils';

import { getSessionScopes } from './utils';
import type { SimulationAccount } from '../../options';

export type CreateSessionHandlerHooks = {
  grantPermissions: (permissions: RequestedPermissions) => void;
  getAccounts: () => SimulationAccount[];
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

  const accounts = hooks
    .getAccounts()
    .flatMap((account) =>
      account.scopes.map((scope) => `${scope}:${account.address}`),
    );

  const caveatWithAccounts = setNonSCACaipAccountIdsInCaip25CaveatValue(
    caveat,
    accounts as CaipAccountId[],
  );

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
