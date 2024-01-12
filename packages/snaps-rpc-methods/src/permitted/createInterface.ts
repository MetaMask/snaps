import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type {
  Component,
  CreateInterfaceParams,
  CreateInterfaceResult,
  JsonRpcRequest,
} from '@metamask/snaps-sdk';
import { ComponentStruct, assert } from '@metamask/snaps-sdk';
import { SnapEndowments, type InferMatching } from '@metamask/snaps-utils';
import type { PendingJsonRpcResponse } from '@metamask/utils';
import { StructError, create, object } from 'superstruct';

import type { MethodHooksObject } from '../utils';

const hookNames: MethodHooksObject<CreateInterfaceMethodHooks> = {
  hasPermission: true,
  createInterface: true,
};

export type CreateInterfaceMethodHooks = {
  /**
   * @param permissionName - The name of the permission invoked.
   * @returns Whether the snap has permission to invoke this RPC method or not.
   */
  hasPermission: (permissionName: string) => boolean;
  /**
   * @param ui - The UI components.
   * @returns The unique identifier of the interface.
   */
  createInterface: (ui: Component) => string;
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
  ui: ComponentStruct,
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
 * @param hooks.hasPermission - The function to check if the snap has the specific permission.
 * @returns Nothing.
 */
function getCreateInterfaceImplementation(
  req: JsonRpcRequest<CreateInterfaceParameters>,
  res: PendingJsonRpcResponse<CreateInterfaceResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { createInterface, hasPermission }: CreateInterfaceMethodHooks,
): void {
  const { params } = req;

  try {
    assert(hasPermission(SnapEndowments.UserInput), rpcErrors.methodNotFound());
    const validatedParams = getValidatedParams(params);

    const { ui } = validatedParams;

    res.result = createInterface(ui);
  } catch (error) {
    return end(error);
  }

  return end();
}

/**
 * Validates the createInterface method `params` and returns them cast to the correct
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
