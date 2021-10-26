import type { PermittedHandlerExport } from '@metamask/rpc-methods/types';
import type {
  JsonRpcEngineEndCallback,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from 'json-rpc-engine';
import { nanoid } from 'nanoid';
import { MethodNames } from '../utils';

import { invalidParams } from '../errors';
import type { PermissionConstraint, RequestedPermissions } from '../Permission';

export const requestPermissionsHandler: PermittedHandlerExport<
  RequestPermissionsHooks,
  [RequestedPermissions],
  PermissionConstraint[]
> = {
  methodNames: [MethodNames.requestPermissions],
  implementation: requestPermissionsImplementation,
  methodDescription: 'Request permissions.',
  hookNames: {
    requestPermissions: true,
  },
};

type RequestPermissions = (
  requestedPermissions: RequestedPermissions,
  id: string,
) => Promise<
  [Record<string, PermissionConstraint>, { id: string; origin: string }]
>;

export type RequestPermissionsHooks = {
  requestPermissions: RequestPermissions;
};

async function requestPermissionsImplementation(
  req: JsonRpcRequest<[RequestedPermissions]>,
  res: PendingJsonRpcResponse<PermissionConstraint[]>,
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
