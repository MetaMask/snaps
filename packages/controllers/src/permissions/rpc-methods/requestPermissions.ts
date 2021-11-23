import { ethErrors } from 'eth-rpc-errors';
import type { PermittedHandlerExport } from '@metamask/rpc-methods/types';
import type {
  JsonRpcEngineEndCallback,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from 'json-rpc-engine';
import { MethodNames } from '../utils';

import { invalidParams } from '../errors';
import type { PermissionConstraint, RequestedPermissions } from '../Permission';
import { isPlainObject } from '../../utils';

export const requestPermissionsHandler: PermittedHandlerExport<
  RequestPermissionsHooks,
  [RequestedPermissions],
  PermissionConstraint[]
> = {
  methodNames: [MethodNames.requestPermissions],
  implementation: requestPermissionsImplementation,
  hookNames: {
    requestPermissionsForOrigin: true,
  },
};

type RequestPermissions = (
  requestedPermissions: RequestedPermissions,
  id: string,
) => Promise<
  [Record<string, PermissionConstraint>, { id: string; origin: string }]
>;

export type RequestPermissionsHooks = {
  requestPermissionsForOrigin: RequestPermissions;
};

async function requestPermissionsImplementation(
  req: JsonRpcRequest<[RequestedPermissions]>,
  res: PendingJsonRpcResponse<PermissionConstraint[]>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { requestPermissionsForOrigin }: RequestPermissionsHooks,
): Promise<void> {
  const { id, params } = req;

  if (
    (typeof id !== 'number' && typeof id !== 'string') ||
    (typeof id === 'string' && !id)
  ) {
    return end(
      ethErrors.rpc.invalidRequest({
        message: 'Invalid request: Must specify a valid id.',
        data: { request: req },
      }),
    );
  }

  if (!Array.isArray(params) || !isPlainObject(params[0])) {
    return end(invalidParams({ data: { request: req } }));
  }

  const [requestedPermissions] = params;
  const [grantedPermissions] = await requestPermissionsForOrigin(
    requestedPermissions,
    String(id),
  );

  // `wallet_requestPermission` is specified to return an array.
  res.result = Object.values(grantedPermissions);
  return end();
}
