import type { JsonRpcMiddleware } from '@metamask/json-rpc-engine';
import type {
  PermissionConstraint,
  RequestedPermissions,
} from '@metamask/permission-controller';
import { isEqual } from '@metamask/snaps-utils';
import { hasProperty, type Json, type JsonRpcParams } from '@metamask/utils';

import { SnapEndowments } from '../endowments';

export type PreinstalledSnapsMiddlewareHooks = {
  getPermittedEvmAccounts: () => string[];
  getAllEvmAccounts: () => string[];
  getPermissions: () => Record<string, PermissionConstraint> | undefined;
  grantPermissions: (permissions: RequestedPermissions) => void;
};

/**
 * Creates a middleware that automatically grants permissions to preinstalled Snaps
 * that want to use the Ethereum provider endowment.
 *
 * @param hooks - The hooks used by the middleware.
 * @param hooks.getPermittedEvmAccounts
 * @param hooks.getAllEvmAccounts
 * @param hooks.getPermissions
 * @param hooks.grantPermissions
 * @returns The middleware.
 */
export function createPreinstalledSnapsMiddleware({
  getPermittedEvmAccounts,
  getAllEvmAccounts,
  getPermissions,
  grantPermissions,
}: PreinstalledSnapsMiddlewareHooks): JsonRpcMiddleware<JsonRpcParams, Json> {
  return function methodMiddleware(request, _response, next, _end) {
    if (
      !request.method.startsWith('wallet') &&
      !request.method.startsWith('eth')
    ) {
      return next();
    }

    const permissions = getPermissions();

    if (
      !permissions ||
      !hasProperty(permissions, SnapEndowments.EthereumProvider)
    ) {
      return next();
    }

    const evmAccounts = getAllEvmAccounts();
    const existingEvmAccounts = getPermittedEvmAccounts();

    if (isEqual(evmAccounts, existingEvmAccounts)) {
      return next();
    }

    grantPermissions({
      'endowment:caip25': {
        caveats: [
          {
            type: 'authorizedScopes',
            value: {
              requiredScopes: {},
              optionalScopes: {
                'wallet:eip155': {
                  accounts: evmAccounts.map(
                    (account) => `wallet:eip155:${account}`,
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
