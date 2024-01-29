import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type {
  Component,
  UpdateInterfaceParams,
  UpdateInterfaceResult,
  JsonRpcRequest,
} from '@metamask/snaps-sdk';
import { ComponentStruct } from '@metamask/snaps-sdk';
import { type InferMatching } from '@metamask/snaps-utils';
import type { PendingJsonRpcResponse } from '@metamask/utils';
import { StructError, create, object, string } from 'superstruct';

import type { MethodHooksObject } from '../utils';

const hookNames: MethodHooksObject<UpdateInterfaceMethodHooks> = {
  updateInterface: true,
};

export type UpdateInterfaceMethodHooks = {
  /**
   * @param id - The interface ID.
   * @param ui - The UI components.
   */
  updateInterface: (id: string, ui: Component) => Promise<void>;
};

export const updateInterfaceHandler: PermittedHandlerExport<
  UpdateInterfaceMethodHooks,
  UpdateInterfaceParameters,
  UpdateInterfaceResult
> = {
  methodNames: ['snap_updateInterface'],
  implementation: getUpdateInterfaceImplementation,
  hookNames,
};

const UpdateInterfaceParametersStruct = object({
  id: string(),
  ui: ComponentStruct,
});

export type UpdateInterfaceParameters = InferMatching<
  typeof UpdateInterfaceParametersStruct,
  UpdateInterfaceParams
>;

/**
 * The `snap_updateInterface` method implementation.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.updateInterface - The function to update the interface.
 * @returns Nothing.
 */
async function getUpdateInterfaceImplementation(
  req: JsonRpcRequest<UpdateInterfaceParameters>,
  res: PendingJsonRpcResponse<UpdateInterfaceResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { updateInterface }: UpdateInterfaceMethodHooks,
): Promise<void> {
  const { params } = req;

  try {
    const validatedParams = getValidatedParams(params);

    const { id, ui } = validatedParams;

    await updateInterface(id, ui);
    res.result = null;
  } catch (error) {
    return end(error);
  }

  return end();
}

/**
 * Validate the updateInterface method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated updateInterface method parameter object.
 */
function getValidatedParams(params: unknown): UpdateInterfaceParameters {
  try {
    return create(params, UpdateInterfaceParametersStruct);
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
