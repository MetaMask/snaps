import type {
  JsonRpcEngineEndCallback,
  MethodHandler,
} from '@metamask/json-rpc-engine';
import type { Messenger } from '@metamask/messenger';
import type { PermissionControllerHasPermissionAction } from '@metamask/permission-controller';
import { providerErrors, rpcErrors } from '@metamask/rpc-errors';
import type {
  CancelBackgroundEventParams,
  CancelBackgroundEventResult,
  SnapId,
} from '@metamask/snaps-sdk';
import { type InferMatching } from '@metamask/snaps-utils';
import { StructError, create, object, string } from '@metamask/superstruct';
import { type PendingJsonRpcResponse } from '@metamask/utils';

import { SnapEndowments } from '../endowments';
import type {
  CronjobControllerCancelAction,
  JsonRpcRequestWithOrigin,
} from '../types';

export type CancelBackgroundEventMethodActions =
  | PermissionControllerHasPermissionAction
  | CronjobControllerCancelAction;

/**
 * Cancel a background event created by
 * [`snap_scheduleBackgroundEvent`](https://docs.metamask.io/snaps/reference/snaps-api/snap_schedulebackgroundevent).
 *
 * @example
 * ```ts
 * const id = await snap.request({
 *   method: 'snap_scheduleBackgroundEvent',
 *   params: {
 *     // ...
 *   },
 * });
 *
 * // Later, when you want to cancel the background event:
 * snap.request({
 *   method: 'snap_cancelBackgroundEvent',
 *   params: { id },
 * });
 * ```
 */
export const cancelBackgroundEventHandler = {
  implementation: getCancelBackgroundEventImplementation,
  actionNames: [
    'PermissionController:hasPermission',
    'CronjobController:cancel',
  ],
} satisfies MethodHandler<
  never,
  CancelBackgroundEventMethodActions,
  CancelBackgroundEventParameters,
  CancelBackgroundEventResult,
  { origin: SnapId }
>;

const CancelBackgroundEventsParametersStruct = object({
  id: string(),
});

export type CancelBackgroundEventParameters = InferMatching<
  typeof CancelBackgroundEventsParametersStruct,
  CancelBackgroundEventParams
>;

/**
 * The `snap_cancelBackgroundEvent` method implementation.
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
async function getCancelBackgroundEventImplementation(
  req: JsonRpcRequestWithOrigin<CancelBackgroundEventParameters>,
  res: PendingJsonRpcResponse<CancelBackgroundEventResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  _hooks: never,
  messenger: Messenger<string, CancelBackgroundEventMethodActions>,
): Promise<void> {
  const { params, origin } = req;

  if (
    !messenger.call(
      'PermissionController:hasPermission',
      origin,
      SnapEndowments.Cronjob,
    )
  ) {
    return end(providerErrors.unauthorized());
  }

  try {
    const validatedParams = getValidatedParams(params);

    const { id } = validatedParams;

    messenger.call('CronjobController:cancel', origin, id);
    res.result = null;
  } catch (error) {
    return end(error);
  }

  return end();
}

/**
 * Validate the cancelBackgroundEvent method `params` and returns them cast to the correct type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated resolveInterface method parameter object.
 */
function getValidatedParams(params: unknown): CancelBackgroundEventParameters {
  try {
    return create(params, CancelBackgroundEventsParametersStruct);
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
