import type {
  JsonRpcEngineEndCallback,
  JsonRpcEngineNextCallback,
  MethodHandler,
} from '@metamask/json-rpc-engine';
import type { Messenger } from '@metamask/messenger';
import type { PermissionControllerExecuteRestrictedMethodAction } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type { InvokeSnapParams, InvokeSnapResult } from '@metamask/snaps-sdk';
import type { PendingJsonRpcResponse } from '@metamask/utils';
import { isObject } from '@metamask/utils';

import { WALLET_SNAP_PERMISSION_KEY } from '../restricted/invokeSnap';
import type { JsonRpcRequestWithOrigin } from '../types';

export type InvokeSnapSugarMethodActions =
  PermissionControllerExecuteRestrictedMethodAction;

/**
 * Invoke a method of a Snap, designated by the `snapId` parameter, with a
 * JSON-RPC request specified in the `request` parameter. This is effectively a
 * wrapper around [`wallet_snap`](https://docs.metamask.io/snaps/reference/snaps-api/wallet_snap)
 * that allows for more convenient invocation of Snap methods without needing to
 * specify the full `wallet_snap` parameters.
 *
 * The Snap must be installed and the dapp must have permission to communicate
 * with the Snap, or the request is rejected. The dapp can install the Snap and
 * request permission to communicate with it using [`wallet_requestSnaps`](https://docs.metamask.io/snaps/reference/snaps-api/wallet_requestsnaps).
 *
 * @example
 * ```ts
 * const result = await snap.request({
 *   method: 'wallet_invokeSnap',
 *   params: {
 *     snapId: 'npm:@metamask/example-snap',
 *     request: {
 *       method: 'someMethod',
 *       params: { some: 'params' },
 *     },
 *   },
 * });
 * ```
 */
export const invokeSnapSugarHandler = {
  implementation: invokeSnapSugar,
  actionNames: ['PermissionController:executeRestrictedMethod'],
} satisfies MethodHandler<
  never,
  InvokeSnapSugarMethodActions,
  InvokeSnapParams,
  InvokeSnapResult,
  { origin: string }
>;

/**
 * The `wallet_invokeSnap` method implementation.
 * Effectively calls `wallet_snap` under the hood.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param _hooks - The RPC method hooks. Not used by this function.
 * @param messenger - The messenger used to call controller actions.
 * @returns Nothing.
 * @throws If the params are invalid.
 */
export async function invokeSnapSugar(
  req: JsonRpcRequestWithOrigin<InvokeSnapParams>,
  // `InvokeSnapResult` is an alias for `Json` (which is the default type
  // argument for `PendingJsonRpcResponse`), but that may not be the case in the
  // future. We use `InvokeSnapResult` here to make it clear that this is the
  // expected type of the result.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-arguments
  res: PendingJsonRpcResponse<InvokeSnapResult>,
  _next: JsonRpcEngineNextCallback,
  end: JsonRpcEngineEndCallback,
  _hooks: never,
  messenger: Messenger<string, InvokeSnapSugarMethodActions>,
): Promise<void> {
  try {
    const params = getValidatedParams(req.params);
    res.result = await messenger.call(
      'PermissionController:executeRestrictedMethod',
      req.origin,
      WALLET_SNAP_PERMISSION_KEY,
      params,
    );
  } catch (error) {
    return end(error);
  }
  return end();
}

/**
 * Validates the wallet_invokeSnap method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated method parameter object.
 */
export function getValidatedParams(params: unknown): InvokeSnapParams {
  if (!isObject(params)) {
    throw rpcErrors.invalidParams({
      message: 'Expected params to be a single object.',
    });
  }

  const { snapId, request } = params;

  if (!snapId || typeof snapId !== 'string' || snapId === '') {
    throw rpcErrors.invalidParams({
      message: 'Must specify a valid snap ID.',
    });
  }

  if (!isObject(request)) {
    throw rpcErrors.invalidParams({
      message: 'Expected request to be a single object.',
    });
  }

  return params as InvokeSnapParams;
}
