import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
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
import type { MethodHooksObject } from '../utils';

const hookNames: MethodHooksObject<ClearStateHooks> = {
  clearSnapState: true,
  hasPermission: true,
};

/**
 * `snap_clearState` clears the state of the Snap.
 */
export const clearStateHandler: PermittedHandlerExport<
  ClearStateHooks,
  ClearStateParameters,
  ClearStateResult
> = {
  methodNames: ['snap_clearState'],
  implementation: clearStateImplementation,
  hookNames,
};

export type ClearStateHooks = {
  /**
   * A function that clears the state of the requesting Snap.
   */
  clearSnapState: (snapId: string, encrypted: boolean) => void;

  /**
   * Check if the requesting origin has a given permission.
   *
   * @param permissionName - The name of the permission to check.
   * @returns Whether the origin has the permission.
   */
  hasPermission: (permissionName: string) => boolean;
};

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
 * @param hooks - The RPC method hooks.
 * @param hooks.clearSnapState - A function that clears the state of the
 * requesting Snap.
 * @param hooks.hasPermission - Check whether a given origin has a given
 * permission.
 * @returns Nothing.
 */
async function clearStateImplementation(
  request: JsonRpcRequest<ClearStateParameters>,
  response: PendingJsonRpcResponse<ClearStateResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { clearSnapState, hasPermission }: ClearStateHooks,
): Promise<void> {
  const { params } = request;

  if (!hasPermission(manageStateBuilder.targetName)) {
    return end(providerErrors.unauthorized());
  }

  try {
    const validatedParams = getValidatedParams(params);
    const { encrypted = true } = validatedParams;

    // We expect the MM middleware stack to always add the origin to requests
    const { origin } = request as JsonRpcRequest & { origin: string };
    clearSnapState(origin, encrypted);

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
