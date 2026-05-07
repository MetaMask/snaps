import type {
  JsonRpcEngineEndCallback,
  MethodHandler,
} from '@metamask/json-rpc-engine';
import type { Messenger } from '@metamask/messenger';
import type { PermissionControllerHasPermissionAction } from '@metamask/permission-controller';
import { providerErrors, rpcErrors } from '@metamask/rpc-errors';
import type {
  GetInterfaceStateParams,
  GetInterfaceStateResult,
  JsonRpcRequest,
} from '@metamask/snaps-sdk';
import { type InferMatching } from '@metamask/snaps-utils';
import { StructError, create, object, string } from '@metamask/superstruct';
import type { PendingJsonRpcResponse } from '@metamask/utils';

import type { SnapInterfaceControllerGetInterfaceStateAction } from '../types';
import { UI_PERMISSIONS } from '../utils';

export type GetInterfaceStateMethodActions =
  | PermissionControllerHasPermissionAction
  | SnapInterfaceControllerGetInterfaceStateAction;

/**
 * Get the form state of an [interface](https://docs.metamask.io/snaps/features/custom-ui/interactive-ui/)
 * created by [`snap_createInterface`](https://docs.metamask.io/snaps/reference/snaps-api/snap_createinterface).
 *
 * @example
 * ```ts
 * const state = await snap.request({
 *   method: 'snap_getInterfaceState',
 *   params: {
 *     id: interfaceId,
 *   },
 * });
 * ```
 */
export const getInterfaceStateHandler = {
  implementation: getGetInterfaceStateImplementation,
  actionNames: [
    'PermissionController:hasPermission',
    'SnapInterfaceController:getInterfaceState',
  ],
} satisfies MethodHandler<
  never,
  GetInterfaceStateMethodActions,
  GetInterfaceStateParameters,
  GetInterfaceStateResult,
  { origin: string }
>;

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
 * @param _hooks - The RPC method hooks. Not used by this function.
 * @param messenger - The messenger used to call controller actions.
 * @returns Nothing.
 */
function getGetInterfaceStateImplementation(
  req: JsonRpcRequest<GetInterfaceStateParameters> & { origin: string },
  res: PendingJsonRpcResponse<GetInterfaceStateResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  _hooks: never,
  messenger: Messenger<string, GetInterfaceStateMethodActions>,
): void {
  const { params, origin } = req;

  const isPermitted = UI_PERMISSIONS.some((permission) =>
    messenger.call('PermissionController:hasPermission', origin, permission),
  );

  if (!isPermitted) {
    return end(
      providerErrors.unauthorized({
        message: `This method can only be used if the Snap has one of the following permissions: ${UI_PERMISSIONS.join(', ')}.`,
      }),
    );
  }

  try {
    const validatedParams = getValidatedParams(params);

    const { id } = validatedParams;

    res.result = messenger.call(
      'SnapInterfaceController:getInterfaceState',
      origin,
      id,
    );
  } catch (error) {
    return end(error);
  }

  return end();
}

/**
 * Validate the getInterfaceState method `params` and returns them cast to the correct
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
