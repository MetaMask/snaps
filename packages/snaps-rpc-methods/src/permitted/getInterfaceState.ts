import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type {
  GetInterfaceStateParams,
  GetInterfaceStateResult,
  InterfaceState,
  JsonRpcRequest,
} from '@metamask/snaps-sdk';
import { assert } from '@metamask/snaps-sdk';
import { SnapEndowments, type InferMatching } from '@metamask/snaps-utils';
import type { PendingJsonRpcResponse } from '@metamask/utils';
import { StructError, create, object, string } from 'superstruct';

import type { MethodHooksObject } from '../utils';

const hookNames: MethodHooksObject<GetInterfaceStateMethodHooks> = {
  hasPermission: true,
  getInterfaceState: true,
};

export type GetInterfaceStateMethodHooks = {
  /**
   * @param permissionName - The name of the permission invoked.
   * @returns Whether the snap has permission to invoke this RPC method or not.
   */
  hasPermission: (permissionName: string) => boolean;
  /**
   * @param id - The interface ID.
   * @returns The interface state.
   */
  getInterfaceState: (id: string) => InterfaceState;
};

export const getInterfaceStateHandler: PermittedHandlerExport<
  GetInterfaceStateMethodHooks,
  GetInterfaceStateParameters,
  GetInterfaceStateResult
> = {
  methodNames: ['snap_getInterfaceState'],
  implementation: getGetInterfaceStateImplementation,
  hookNames,
};

const GetInterfaceStateParametersStruct = object({
  id: string(),
});

export type GetInterfaceStateParameters = InferMatching<
  typeof GetInterfaceStateParametersStruct,
  GetInterfaceStateParams
>;

/**
 * The `snap_getInterfaceState` method implementation.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.getInterfaceState - The function to get the interface state.
 * @param hooks.hasPermission - The function to check if the snap has the specific permission.
 * @returns Noting.
 */
function getGetInterfaceStateImplementation(
  req: JsonRpcRequest<GetInterfaceStateParameters>,
  res: PendingJsonRpcResponse<GetInterfaceStateResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { getInterfaceState, hasPermission }: GetInterfaceStateMethodHooks,
): void {
  // We expect the MM middleware stack to always add the origin to requests
  const { params } = req;

  try {
    assert(hasPermission(SnapEndowments.UserInput), rpcErrors.methodNotFound());
    const validatedParams = getValidatedParams(params);

    const { id } = validatedParams;

    res.result = getInterfaceState(id);
  } catch (error) {
    return end(error);
  }

  return end();
}

/**
 * Validates the getInterfaceState method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated getInterfaceState method parameter object.
 */
function getValidatedParams(params: unknown): GetInterfaceStateParameters {
  try {
    return create(params, GetInterfaceStateParametersStruct);
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
