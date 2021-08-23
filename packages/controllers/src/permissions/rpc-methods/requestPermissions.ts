import type { PermittedHandlerExport } from '@mm-snap/rpc-methods/types';
import type {
  JsonRpcEngineEndCallback,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from 'json-rpc-engine';
import { nanoid } from 'nanoid';

import { invalidParams } from '../errors';
import type { Permission, RequestedPermissions } from '../Permission';

export const requestPermissionsHandler: PermittedHandlerExport<
  RequestPermissionsHooks,
  [RequestedPermissions],
  Permission[]
> = {
  methodNames: ['wallet_requestPermissions'],
  implementation: requestPermissionsImplementation,
  methodDescription: 'Request permissions.',
  hookNames: {
    requestPermissions: true,
  },
};

// PermissionEnforcer['requestPermissions'] but with the origin parameter bound
type RequestPermissions = (
  requestedPermissions: RequestedPermissions,
  id: string,
) => Promise<[Record<string, Permission>, { id: string; origin: string }]>;

export type RequestPermissionsHooks = {
  requestPermissions: RequestPermissions;
};

async function requestPermissionsImplementation(
  req: JsonRpcRequest<[RequestedPermissions]>,
  res: PendingJsonRpcResponse<Permission[]>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { requestPermissions }: RequestPermissionsHooks,
): Promise<void> {
  if (
    !Array.isArray(req.params) ||
    !req.params[0] ||
    typeof req.params[0] !== 'object' ||
    Array.isArray(req.params[0])
  ) {
    return end(invalidParams({ data: { request: req } }));
  }

  const id =
    typeof req.id === 'number' || req.id ? req.id.toString() : nanoid();

  try {
    res.result = Object.values(
      (await requestPermissions(req.params[0], id))[0],
    );
    return end();
  } catch (error) {
    return end(error);
  }
}
