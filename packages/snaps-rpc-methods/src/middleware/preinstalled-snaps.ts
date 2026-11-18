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
   * Get all available scopes with the eip155 prefix.
   *
   * @returns A list of all available scopes.
   */
  getEvmScopes: () => CaipChainId[];
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

type ScopesObject = Record<CaipChainId, { accounts: CaipAccountId[] }>;

type AuthorizedScopeCaveat = {
  requiredScopes: ScopesObject;
  optionalScopes: ScopesObject;
  sessionProperties: Record<string, Json>;
  isMultichainOrigin: boolean;
};

/**
 * Create a scopes object for a set of scopes and accounts.
 *
 * @param scopes - The scopes.
 * @param accounts - The accounts.
 * @returns The ScopesObject
 */
function createScopesObject(
  scopes: CaipChainId[],
  accounts: string[],
): ScopesObject {
  return scopes.reduce<ScopesObject>((accumulator, scope) => {
    accumulator[scope] = {
      accounts: accounts.map(
        (account) => `${scope}:${account}`,
      ) as CaipAccountId[],
    };
    return accumulator;
  }, {});
}

/**
 * Create a middleware that automatically grants account permissions to preinstalled Snaps
 * that want to use the Ethereum provider endowment.
 *
 * @param hooks - The hooks used by the middleware.
 * @param hooks.getEvmScopes - Hook for retrieving all available EVM scopes.
 * @param hooks.getAllEvmAccounts - Hook for retrieving all available EVM addresses.
 * @param hooks.getPermissions - Hook for retrieving the permissions of the requesting origin.
 * @param hooks.grantPermissions - Hook for granting permissions to the requesting origin.
 * @returns The middleware.
 */
export function createPreinstalledSnapsMiddleware({
  getEvmScopes,
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

    const evmScopes = getEvmScopes();
    const evmAccounts = getAllEvmAccounts();

    const hasAllAccounts = evmScopes.every((scope) => {
      const existingScope =
        existingRequiredScopes[scope] ?? existingOptionalScopes[scope];
      const existingScopedAccounts =
        existingScope?.accounts.map((account) =>
          account.slice(scope.length + 1),
        ) ?? [];
      return isEqual(evmAccounts, existingScopedAccounts);
    });

    if (hasAllAccounts) {
      return next();
    }

    const requiredScopes = Object.keys(existingRequiredScopes) as CaipChainId[];
    const newRequiredScopes = createScopesObject(requiredScopes, evmAccounts);

    const optionalScopes = evmScopes.filter(
      (scope) => !requiredScopes.includes(scope),
    );
    const newOptionalScopes = {
      ...createScopesObject(optionalScopes, evmAccounts),
      'wallet:eip155': { accounts: [] },
    };

    grantPermissions({
      'endowment:caip25': {
        caveats: [
          {
            type: 'authorizedScopes',
            value: {
              requiredScopes: newRequiredScopes,
              optionalScopes: newOptionalScopes,
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
