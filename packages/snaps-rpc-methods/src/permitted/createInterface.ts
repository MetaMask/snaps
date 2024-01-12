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
import type { InferMatching } from '@metamask/snaps-utils';
import type { PendingJsonRpcResponse } from '@metamask/utils';
import { StructError, create, object } from 'superstruct';

import type { MethodHooksObject } from '../utils';

const hookNames: MethodHooksObject<CreateInterfaceMethodHooks> = {
  hasPermission: true,
  createInterface: true,
};

export type CreateInterfaceMethodHooks = {
  /**
   * @param origin - The origin invoking the rpc-method.
   * @param permissionName - The name of the permission invoked.
   * @returns Whether if the snap has permission to invoke this rpc-method.
   */
  hasPermission: (origin: string, permissionName: string) => boolean;
  /**
   * @param snapId - The ID of the Snap that is showing the interface.
   * @param ui - The UI components.
   * @returns The unique identifier of the interface.
   */
  createInterface: (snapId: string, ui: Component) => string;
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
  // We expect the MM middleware stack to always add the origin to requests
  const { params, origin } = req as JsonRpcRequest & { origin: string };

  try {
    // @TODO: export the endowment name from somwhere ?
    assert(
      origin && hasPermission(origin, 'endowment:user-input'),
      rpcErrors.methodNotFound(),
    );
    const validatedParams = getValidatedParams(params);

    const { ui } = validatedParams;

    res.result = createInterface(origin, ui);
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
