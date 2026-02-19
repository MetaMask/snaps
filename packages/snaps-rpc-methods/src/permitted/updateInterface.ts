import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { providerErrors, rpcErrors } from '@metamask/rpc-errors';
import type {
  UpdateInterfaceParams,
  UpdateInterfaceResult,
  JsonRpcRequest,
  ComponentOrElement,
  InterfaceContext,
} from '@metamask/snaps-sdk';
import {
  ComponentOrElementStruct,
  InterfaceContextStruct,
} from '@metamask/snaps-sdk';
import { type InferMatching } from '@metamask/snaps-utils';
import {
  StructError,
  create,
  object,
  optional,
  string,
} from '@metamask/superstruct';
import type { PendingJsonRpcResponse } from '@metamask/utils';

import type { MethodHooksObject } from '../utils';
import { UI_PERMISSIONS } from '../utils';

const methodName = 'snap_updateInterface';

const hookNames: MethodHooksObject<UpdateInterfaceMethodHooks> = {
  hasPermission: true,
  updateInterface: true,
};

export type UpdateInterfaceMethodHooks = {
  /**
   * @param permissionName - The name of the permission to check.
   * @returns Whether the Snap has the permission.
   */
  hasPermission: (permissionName: string) => boolean;

  /**
   * @param id - The interface ID.
   * @param ui - The UI components.
   * @param context - The optional interface context object.
   */
  updateInterface: (
    id: string,
    ui: ComponentOrElement,
    context?: InterfaceContext,
  ) => void;
};

export const updateInterfaceHandler = {
  methodNames: [methodName] as const,
  implementation: getUpdateInterfaceImplementation,
  hookNames,
} satisfies PermittedHandlerExport<
  UpdateInterfaceMethodHooks,
  UpdateInterfaceParameters,
  UpdateInterfaceResult
>;

const UpdateInterfaceParametersStruct = object({
  id: string(),
  ui: ComponentOrElementStruct,
  context: optional(InterfaceContextStruct),
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
 * @param hooks.hasPermission - The function to check if the Snap has a given
 * permission.
 * @param hooks.updateInterface - The function to update the interface.
 * @returns Nothing.
 */
function getUpdateInterfaceImplementation(
  req: JsonRpcRequest<UpdateInterfaceParameters>,
  res: PendingJsonRpcResponse<UpdateInterfaceResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { hasPermission, updateInterface }: UpdateInterfaceMethodHooks,
): void {
  if (!UI_PERMISSIONS.some(hasPermission)) {
    return end(providerErrors.unauthorized());
  }

  const { params } = req;

  try {
    const validatedParams = getValidatedParams(params);

    const { id, ui, context } = validatedParams;

    updateInterface(id, ui, context);
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
