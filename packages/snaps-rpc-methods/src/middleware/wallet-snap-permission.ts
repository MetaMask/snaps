import type {
  JsonRpcCall,
  JsonRpcMiddleware,
} from '@metamask/json-rpc-engine/v2';
import { rpcErrors } from '@metamask/rpc-errors';
import type { Json } from '@metamask/utils';

import { WALLET_SNAP_PERMISSION_KEY } from '../restricted';

type RequestParams = [Record<string, Json>];

/**
 * Create a middleware that validates `wallet_requestPermissions` calls that
 * include the `wallet_snap` permission.
 *
 * This prevents requesting the `wallet_snap` permission in the same call as
 * other permissions, which could lead to a confusing user experience where
 * multiple permission screens are shown at once, or the other permissions are
 * not displayed properly because the `wallet_snap` permission screen takes
 * precedence.
 *
 * @returns The middleware.
 */
export function createWalletSnapPermissionMiddleware(): JsonRpcMiddleware<
  JsonRpcCall<RequestParams>
> {
  return async ({ request, next }) => {
    if (request.method === 'wallet_requestPermissions') {
      const requestedPermissions = request.params?.[0];
      const requestedPermissionsKeys = Object.keys(requestedPermissions ?? {});

      if (
        requestedPermissionsKeys.length > 1 &&
        requestedPermissionsKeys.includes(WALLET_SNAP_PERMISSION_KEY)
      ) {
        throw rpcErrors.invalidParams(
          'Permission request for `wallet_snap` cannot include other permissions. Please separate your permission requests into multiple calls to `wallet_requestPermissions`.',
        );
      }
    }

    return await next();
  };
}
