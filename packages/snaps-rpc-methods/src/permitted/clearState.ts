import type {
  JsonRpcEngineEndCallback,
  MethodHandler,
} from '@metamask/json-rpc-engine';
import type { Messenger } from '@metamask/messenger';
import type { PermissionControllerHasPermissionAction } from '@metamask/permission-controller';
import { providerErrors, rpcErrors } from '@metamask/rpc-errors';
import type { ClearStateParams, ClearStateResult } from '@metamask/snaps-sdk';
import { type InferMatching } from '@metamask/snaps-utils';
import {
  boolean,
  create,
  object,
  optional,
  StructError,
} from '@metamask/superstruct';
import type { PendingJsonRpcResponse, JsonRpcRequest } from '@metamask/utils';

import { manageStateBuilder } from '../restricted/manageState';
import type { SnapControllerClearSnapStateAction } from '../types';

export type ClearStateMethodActions =
  | PermissionControllerHasPermissionAction
  | SnapControllerClearSnapStateAction;

/**
 * Clear the entire state of the Snap.
 *
 * @example
 * ```ts
 * await snap.request({
 *   method: 'snap_clearState',
 *   params: {
 *     encrypted: true, // Optional, defaults to true
 *   },
 * });
 * ```
 */
export const clearStateHandler = {
  implementation: clearStateImplementation,
  actionNames: [
    'PermissionController:hasPermission',
    'SnapController:clearSnapState',
  ],
} satisfies MethodHandler<
  never,
  ClearStateMethodActions,
  ClearStateParameters,
  ClearStateResult,
  { origin: string }
>;

const ClearStateParametersStruct = object({
  encrypted: optional(boolean()),
});

export type ClearStateParameters = InferMatching<
  typeof ClearStateParametersStruct,
  ClearStateParams
>;

/**
 * The `snap_clearState` method implementation.
 *
 * @param request - The JSON-RPC request object.
 * @param response - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param _hooks - The RPC method hooks. Not used by this function.
 * @param messenger - The messenger used to call controller actions.
 * @returns Nothing.
 */
async function clearStateImplementation(
  request: JsonRpcRequest<ClearStateParameters> & { origin: string },
  response: PendingJsonRpcResponse<ClearStateResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  _hooks: never,
  messenger: Messenger<string, ClearStateMethodActions>,
): Promise<void> {
  const { params, origin } = request;

  if (
    !messenger.call(
      'PermissionController:hasPermission',
      origin,
      manageStateBuilder.targetName,
    )
  ) {
    return end(providerErrors.unauthorized());
  }

  try {
    const validatedParams = getValidatedParams(params);
    const { encrypted = true } = validatedParams;

    messenger.call('SnapController:clearSnapState', origin, encrypted);
    response.result = null;
  } catch (error) {
    return end(error);
  }

  return end();
}

/**
 * Validate the parameters of the `snap_clearState` method.
 *
 * @param params - The parameters to validate.
 * @returns The validated parameters.
 */
function getValidatedParams(params?: unknown) {
  try {
    return create(params, ClearStateParametersStruct);
  } catch (error) {
    if (error instanceof StructError) {
      throw rpcErrors.invalidParams({
        message: `Invalid params: ${error.message}.`,
      });
    }

    /* istanbul ignore next */
    throw rpcErrors.internal();
  }
}
