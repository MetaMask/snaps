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
  methodDescription: 'Get permissions.',
  hookNames: {
    getPermissions: true,
  },
};

export type GetPermissionsHooks = {
  getPermissions: () => SubjectPermissions<PermissionConstraint>;
};

async function getPermissionsImplementation(
  _req: unknown,
  res: PendingJsonRpcResponse<PermissionConstraint[]>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { getPermissions }: GetPermissionsHooks,
): Promise<void> {
  // getPermissions is already bound to the origin
  res.result = Object.values(getPermissions() || {});
  return end();
}
