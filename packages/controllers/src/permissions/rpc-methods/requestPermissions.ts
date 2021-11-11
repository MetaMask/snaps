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

export const requestPermissionsHandler: PermittedHandlerExport<
  RequestPermissionsHooks,
  [RequestedPermissions],
  PermissionConstraint[]
> = {
  methodNames: [MethodNames.requestPermissions],
  implementation: requestPermissionsImplementation,
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

  if (typeof req.id !== 'number' && !req.id) {
    return end(
      ethErrors.rpc.invalidRequest({
        message: 'Invalid request: Must specify an id.',
        data: { request: req },
      }),
    );
  }

  try {
    const [requestedPermissions] = req.params;
    const [grantedPermissions] = await requestPermissions(
      requestedPermissions,
      req.id.toString(),
    );

    // `wallet_requestPermission` is specified to return an array.
    res.result = Object.values(grantedPermissions);
    return end();
  } catch (error) {
    return end(error);
  }
}
