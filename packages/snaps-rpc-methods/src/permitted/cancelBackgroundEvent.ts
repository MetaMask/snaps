import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { providerErrors, rpcErrors } from '@metamask/rpc-errors';
import type {
  JsonRpcRequest,
  CancelBackgroundEventParams,
  CancelBackgroundEventResult,
} from '@metamask/snaps-sdk';
import { type InferMatching } from '@metamask/snaps-utils';
import { StructError, create, object, string } from '@metamask/superstruct';
import { type PendingJsonRpcResponse } from '@metamask/utils';

import { SnapEndowments } from '../endowments';
import type { MethodHooksObject } from '../utils';

const methodName = 'snap_cancelBackgroundEvent';

const hookNames: MethodHooksObject<CancelBackgroundEventMethodHooks> = {
  cancelBackgroundEvent: true,
  hasPermission: true,
};

export type CancelBackgroundEventMethodHooks = {
  cancelBackgroundEvent: (id: string) => void;
  hasPermission: (permissionName: string) => boolean;
};

export const cancelBackgroundEventHandler: PermittedHandlerExport<
  CancelBackgroundEventMethodHooks,
  CancelBackgroundEventParameters,
  CancelBackgroundEventResult
> = {
  methodNames: [methodName],
  implementation: getCancelBackgroundEventImplementation,
  hookNames,
};

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
 * @param hooks - The RPC method hooks.
 * @param hooks.cancelBackgroundEvent - The function to cancel a background event.
 * @param hooks.hasPermission - The function to check if a snap has the `endowment:cronjob` permission.
 * @returns Nothing.
 */
async function getCancelBackgroundEventImplementation(
  req: JsonRpcRequest<CancelBackgroundEventParameters>,
  res: PendingJsonRpcResponse<CancelBackgroundEventResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { cancelBackgroundEvent, hasPermission }: CancelBackgroundEventMethodHooks,
): Promise<void> {
  const { params } = req;

  if (!hasPermission(SnapEndowments.Cronjob)) {
    return end(providerErrors.unauthorized());
  }

  try {
    const validatedParams = getValidatedParams(params);

    const { id } = validatedParams;

    cancelBackgroundEvent(id);
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
