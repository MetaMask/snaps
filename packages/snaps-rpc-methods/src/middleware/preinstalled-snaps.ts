import type { JsonRpcMiddleware } from '@metamask/json-rpc-engine';
import type {
  PermissionConstraint,
  RequestedPermissions,
} from '@metamask/permission-controller';
import { isEqual } from '@metamask/snaps-utils';
import {
  type CaipAccountId,
  type CaipChainId,
  hasProperty,
  type Json,
  type JsonRpcParams,
} from '@metamask/utils';

import { SnapEndowments } from '../endowments';

export type PreinstalledSnapsMiddlewareHooks = {
  /**
   * Get all accounts with the eip155 scope.
   *
   * @returns A list of all account addresses from the eip155 scope.
   */
  getAllEvmAccounts: () => string[];
  /**
   * Get the current permissions for the requesting origin.
   *
   * @returns An object containing the metadata about each permission.
   */
  getPermissions: () => Record<string, PermissionConstraint> | undefined;
  /**
   * Grant the passed permissions to the origin.
   *
   * @param permissions
   */
  grantPermissions: (permissions: RequestedPermissions) => void;
};

const WILDCARD_SCOPE = 'wallet:eip155';

type ScopesObject = Record<CaipChainId, { accounts: CaipAccountId[] }>;

type AuthorizedScopeCaveat = {
  requiredScopes: ScopesObject;
  optionalScopes: ScopesObject;
  sessionProperties: Record<string, Json>;
  isMultichainOrigin: boolean;
};

/**
 * Create a middleware that automatically grants account permissions to preinstalled Snaps
 * that want to use the Ethereum provider endowment.
 *
 * @param hooks - The hooks used by the middleware.
 * @param hooks.getAllEvmAccounts - Hook for retriveing all available EVM addresses.
 * @param hooks.getPermissions - Hook for retrieving the permissions of the requesting origin.
 * @param hooks.grantPermissions - Hook for granting permissions to the requesting origin.
 * @returns The middleware.
 */
export function createPreinstalledSnapsMiddleware({
  getAllEvmAccounts,
  getPermissions,
  grantPermissions,
}: PreinstalledSnapsMiddlewareHooks): JsonRpcMiddleware<JsonRpcParams, Json> {
  return function methodMiddleware(request, _response, next, _end) {
    if (request.method.startsWith('snap')) {
      return next();
    }

    const permissions = getPermissions();

    if (
      !permissions ||
      !hasProperty(permissions, SnapEndowments.EthereumProvider)
    ) {
      return next();
    }

    const existingEndowment = permissions['endowment:caip25'];
    const existingCaveat = existingEndowment?.caveats?.find(
      (caveat) => caveat.type === 'authorizedScopes',
    )?.value as AuthorizedScopeCaveat | undefined;

    const existingRequiredScopes = existingCaveat?.requiredScopes ?? {};
    const existingOptionalScopes = existingCaveat?.optionalScopes ?? {};

    const existingEvmAccounts =
      existingOptionalScopes[WILDCARD_SCOPE]?.accounts.map((account) =>
        account.slice(WILDCARD_SCOPE.length + 1),
      ) ?? [];

    const evmAccounts = getAllEvmAccounts();

    if (isEqual(evmAccounts, existingEvmAccounts)) {
      return next();
    }

    grantPermissions({
      'endowment:caip25': {
        caveats: [
          {
            type: 'authorizedScopes',
            value: {
              requiredScopes: existingRequiredScopes,
              optionalScopes: {
                ...existingOptionalScopes,
                [WILDCARD_SCOPE]: {
                  accounts: evmAccounts.map(
                    (account) => `${WILDCARD_SCOPE}:${account}`,
                  ),
                },
              },
              sessionProperties: {},
              isMultichainOrigin: false,
            },
          },
        ],
      },
    });

    return next();
  };
}
