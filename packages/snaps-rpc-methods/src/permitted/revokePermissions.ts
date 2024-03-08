import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type {
  InitialPermissions,
  RevokePermissionsParams,
  RevokePermissionsResult,
} from '@metamask/snaps-sdk';
import type { Snap, SnapPermissions } from '@metamask/snaps-utils';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';
import { isPlainObject, hasProperty, assert } from '@metamask/utils';

import type { MethodHooksObject } from '../utils';

/**
 * The revokePermissions hook parameters used by the `snap_revokePermissions` method.
 *
 */
export type RevokePermissionsHookParams = (keyof InitialPermissions)[];

export type RevokePermissionsHooks = {
  getOriginSnap: () => Snap | undefined;
  revokePermissions: (dynamicPermissions: RevokePermissionsHookParams) => void;
};

/**
 * The `snap_revokePermissions` method implementation.
 * Revokes dynamic permissions at the runtime.
 *
 * Note: The implementation of this method should mirror
 * the implementation of wallet_requestPermissions as close as possible.
 * (https://github.com/MetaMask/core/blob/main/packages/permission-controller/src/rpc-methods/revokePermissions.ts#L51).
 *
 * @param request - The JSON-RPC request object.
 * @param response - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.getOriginSnap - Get Snap hook.
 * @param hooks.revokePermissions - Revoke permission hook.
 */
async function revokePermissionsImplementation(
  request: JsonRpcRequest<RevokePermissionsParams>,
  response: PendingJsonRpcResponse<RevokePermissionsResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { getOriginSnap, revokePermissions }: RevokePermissionsHooks,
): Promise<void> {
  if (!isPlainObject(request.params)) {
    return end(rpcErrors.invalidParams({ data: { request } }));
  }

  const snap = getOriginSnap();

  const permissionsToRevoke = request.params as SnapPermissions;
  const permissionsToRevokeKeys = Object.keys(
    permissionsToRevoke,
  ) as RevokePermissionsHookParams;

  const initialPermissions = snap?.manifest.initialPermissions;
  const dynamicPermissions = snap?.manifest.dynamicPermissions;

  assert(initialPermissions, 'Failed to get Snap initial permissions.');
  if (!dynamicPermissions) {
    return end(
      rpcErrors.invalidRequest({
        message: 'This Snap has no dynamic permissions specified.',
      }),
    );
  }

  for (const permissionKey of permissionsToRevokeKeys) {
    if (
      hasProperty(initialPermissions, permissionKey) ||
      !hasProperty(dynamicPermissions, permissionKey)
    ) {
      return end(
        rpcErrors.invalidRequest({
          message: `A permission (${String(
            permissionKey,
          )}) requested for revocation is not a dynamic permission.`,
        }),
      );
    }
  }

  revokePermissions(permissionsToRevokeKeys);

  response.result = null;
  return end();
}

const hookNames: MethodHooksObject<RevokePermissionsHooks> = {
  getOriginSnap: true,
  revokePermissions: true,
};

export const revokePermissionsHandler: PermittedHandlerExport<
  RevokePermissionsHooks,
  RevokePermissionsParams,
  null
> = {
  methodNames: ['snap_revokePermissions'],
  implementation: revokePermissionsImplementation,
  hookNames,
};
