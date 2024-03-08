import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type {
  PermittedHandlerExport,
  RequestedPermissions,
} from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type {
  RequestPermissionsParams,
  RequestPermissionsResult,
} from '@metamask/snaps-sdk';
import type { Snap } from '@metamask/snaps-utils';
import { hasProperty, isPlainObject } from '@metamask/utils';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';
import deepEqual from 'fast-deep-equal';

import { processSnapPermissions } from '../permissions';
import type { MethodHooksObject } from '../utils';

export type RequestPermissionsHooks = {
  getOriginSnap: () => Snap | undefined;
  /**
   * @returns Requested permission result.
   */
  requestPermissions: (
    dynamicPermissions: RequestedPermissions,
  ) => Promise<RequestPermissionsResult>;
};

/**
 * The `snap_requestPermissions` method implementation.
 * Requests dynamic permissions at the runtime.
 *
 * Note: The implementation of this method should mirror
 * the implementation of wallet_requestPermissions as close as possible.
 * (https://github.com/MetaMask/core/blob/main/packages/permission-controller/src/rpc-methods/requestPermissions.ts#L45).
 *
 * @param request - The JSON-RPC request object.
 * @param response - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.getOriginSnap - Get Snap hook.
 * @param hooks.requestPermissions - Request permission hook.
 */
async function requestPermissionsImplementation(
  request: JsonRpcRequest<RequestPermissionsParams>,
  response: PendingJsonRpcResponse<RequestPermissionsResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { getOriginSnap, requestPermissions }: RequestPermissionsHooks,
): Promise<void> {
  if (!isPlainObject(request.params)) {
    return end(rpcErrors.invalidParams({ data: { request } }));
  }

  const snap = getOriginSnap();

  const requestedPermissions = request.params;
  const dynamicPermissions = snap?.manifest.dynamicPermissions;

  if (!dynamicPermissions) {
    return end(
      rpcErrors.invalidRequest({
        message: 'This Snap has no dynamic permissions specified.',
      }),
    );
  }

  const requestedPermissionsKeys = Object.keys(
    requestedPermissions,
  ) as (keyof typeof dynamicPermissions)[];

  for (const permissionKey of requestedPermissionsKeys) {
    if (!hasProperty(dynamicPermissions, permissionKey)) {
      return end(
        rpcErrors.invalidRequest({
          message: `Requested dynamic permission (${String(
            permissionKey,
          )}) does not match the allowed dynamic permissions specified in the manifest.`,
        }),
      );
    }

    if (
      !deepEqual(
        requestedPermissions[permissionKey],
        dynamicPermissions[permissionKey],
      )
    ) {
      return end(
        rpcErrors.invalidRequest({
          message: `Requested dynamic permission caveats do not match the allowed dynamic permissions caveats for "${String(
            permissionKey,
          )}".`,
        }),
      );
    }
  }

  const processedRequestedPermissions =
    processSnapPermissions(requestedPermissions);

  response.result = await requestPermissions(processedRequestedPermissions);
  return end();
}

const hookNames: MethodHooksObject<RequestPermissionsHooks> = {
  getOriginSnap: true,
  requestPermissions: true,
};

export const requestPermissionsHandler: PermittedHandlerExport<
  RequestPermissionsHooks,
  RequestPermissionsParams,
  RequestPermissionsResult
> = {
  methodNames: ['snap_requestPermissions'],
  implementation: requestPermissionsImplementation,
  hookNames,
};
