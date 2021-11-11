import type { PermittedHandlerExport } from '@metamask/rpc-methods/types';
import type {
  JsonRpcEngineEndCallback,
  PendingJsonRpcResponse,
} from 'json-rpc-engine';
import { MethodNames } from '../utils';

import type { PermissionConstraint } from '../Permission';
import type { SubjectPermissions } from '../PermissionController';

export const getPermissionsHandler: PermittedHandlerExport<
  GetPermissionsHooks,
  void,
  PermissionConstraint[]
> = {
  methodNames: [MethodNames.getPermissions],
  implementation: getPermissionsImplementation,
  hookNames: {
    getPermissionsForOrigin: true,
  },
};

export type GetPermissionsHooks = {
  // This must be bound to the requesting origin.
  getPermissionsForOrigin: () => SubjectPermissions<PermissionConstraint>;
};

async function getPermissionsImplementation(
  _req: unknown,
  res: PendingJsonRpcResponse<PermissionConstraint[]>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { getPermissionsForOrigin }: GetPermissionsHooks,
): Promise<void> {
  res.result = Object.values(getPermissionsForOrigin() || {});
  return end();
}
