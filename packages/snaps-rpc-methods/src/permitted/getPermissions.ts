import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type {
  PermissionConstraint,
  PermittedHandlerExport,
  SubjectPermissions,
} from '@metamask/permission-controller';
import type {
  GetPermissionsParams,
  GetPermissionsResult,
} from '@metamask/snaps-sdk';
import type { PendingJsonRpcResponse } from '@metamask/utils';

import type { MethodHooksObject } from '../utils';

export type GetPermissionsHooks = {
  /**
   * @returns Granted permissions.
   */
  getPermissions: () => SubjectPermissions<PermissionConstraint>;
};

/**
 * The `snap_getPermissions` method implementation.
 * Get Snap's permissions.
 *
 *
 * @param _request - The JSON-RPC request object.
 * @param response - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.getPermissions - Get Snap hook.
 */
async function getPermissionsImplementation(
  _request: unknown,
  response: PendingJsonRpcResponse<GetPermissionsResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { getPermissions }: GetPermissionsHooks,
): Promise<void> {
  response.result = getPermissions();
  return end();
}

const hookNames: MethodHooksObject<GetPermissionsHooks> = {
  getPermissions: true,
};

export const getPermissionsHandler: PermittedHandlerExport<
  GetPermissionsHooks,
  GetPermissionsParams,
  SubjectPermissions<PermissionConstraint>
> = {
  methodNames: ['snap_getPermissions'],
  implementation: getPermissionsImplementation,
  hookNames,
};
