import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type {
  CreateInterfaceParams,
  CreateInterfaceResult,
  JsonRpcRequest,
  ComponentOrElement,
  InterfaceContext,
} from '@metamask/snaps-sdk';
import {
  ComponentOrElementStruct,
  InterfaceContextStruct,
} from '@metamask/snaps-sdk';
import { type InferMatching } from '@metamask/snaps-utils';
import { StructError, create, object, optional } from '@metamask/superstruct';
import type { PendingJsonRpcResponse } from '@metamask/utils';

import type { MethodHooksObject } from '../utils';

const hookNames: MethodHooksObject<CreateInterfaceMethodHooks> = {
  createInterface: true,
};

export type CreateInterfaceMethodHooks = {
  /**
   * @param ui - The UI components.
   * @returns The unique identifier of the interface.
   */
  createInterface: (
    ui: ComponentOrElement,
    context?: InterfaceContext,
  ) => Promise<string>;
};

export const createInterfaceHandler: PermittedHandlerExport<
  CreateInterfaceMethodHooks,
  CreateInterfaceParameters,
  CreateInterfaceResult
> = {
  methodNames: ['snap_createInterface'],
  implementation: getCreateInterfaceImplementation,
  hookNames,
};

const CreateInterfaceParametersStruct = object({
  ui: ComponentOrElementStruct,
  context: optional(InterfaceContextStruct),
});

export type CreateInterfaceParameters = InferMatching<
  typeof CreateInterfaceParametersStruct,
  CreateInterfaceParams
>;

/**
 * The `snap_createInterface` method implementation.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.createInterface - The function to create the interface.
 * @returns Nothing.
 */
async function getCreateInterfaceImplementation(
  req: JsonRpcRequest<CreateInterfaceParameters>,
  res: PendingJsonRpcResponse<CreateInterfaceResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { createInterface }: CreateInterfaceMethodHooks,
): Promise<void> {
  const { params } = req;

  try {
    const validatedParams = getValidatedParams(params);

    const { ui, context } = validatedParams;

    res.result = await createInterface(ui, context);
  } catch (error) {
    return end(error);
  }

  return end();
}

/**
 * Validate the createInterface method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated createInterface method parameter object.
 */
function getValidatedParams(params: unknown): CreateInterfaceParameters {
  try {
    return create(params, CreateInterfaceParametersStruct);
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
