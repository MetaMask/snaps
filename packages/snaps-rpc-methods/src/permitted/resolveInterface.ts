import type {
  JsonRpcEngineEndCallback,
  MethodHandler,
} from '@metamask/json-rpc-engine';
import type { Messenger } from '@metamask/messenger';
import type { PermissionControllerHasPermissionAction } from '@metamask/permission-controller';
import { providerErrors, rpcErrors } from '@metamask/rpc-errors';
import type {
  JsonRpcRequest,
  ResolveInterfaceParams,
  ResolveInterfaceResult,
} from '@metamask/snaps-sdk';
import type { InferMatching } from '@metamask/snaps-utils';
import { StructError, create, object, string } from '@metamask/superstruct';
import type { PendingJsonRpcResponse } from '@metamask/utils';
import { JsonStruct } from '@metamask/utils';

import type { SnapInterfaceControllerResolveInterfaceAction } from '../types';
import { UI_PERMISSIONS } from '../utils';

export type ResolveInterfaceMethodActions =
  | PermissionControllerHasPermissionAction
  | SnapInterfaceControllerResolveInterfaceAction;

/**
 * Resolve an interactive interface. For use in
 * [custom dialogs](https://docs.metamask.io/snaps/features/custom-ui/dialogs/#display-a-custom-dialog).
 *
 * @example
 * ```ts
 * const id = await snap.request({
 *   method: 'snap_createInterface',
 *   params: {
 *     // The parameters to create the interface with.
 *   },
 * });
 *
 * // Later, when the user has interacted with the interface, and you want to
 * // resolve it:
 * await snap.request({
 *   method: 'snap_resolveInterface',
 *   params: {
 *     id: interfaceId,
 *     value: {
 *       // The value to resolve the interface with.
 *     },
 *   },
 * });
 * ```
 */
export const resolveInterfaceHandler = {
  implementation: getResolveInterfaceImplementation,
  actionNames: [
    'PermissionController:hasPermission',
    'SnapInterfaceController:resolveInterface',
  ],
} satisfies MethodHandler<
  never,
  ResolveInterfaceMethodActions,
  ResolveInterfaceParameters,
  ResolveInterfaceResult,
  { origin: string }
>;

const ResolveInterfaceParametersStruct = object({
  id: string(),
  value: JsonStruct,
});

export type ResolveInterfaceParameters = InferMatching<
  typeof ResolveInterfaceParametersStruct,
  ResolveInterfaceParams
>;

/**
 * The `snap_resolveInterface` method implementation.
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
async function getResolveInterfaceImplementation(
  req: JsonRpcRequest<ResolveInterfaceParameters> & { origin: string },
  res: PendingJsonRpcResponse<ResolveInterfaceResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  _hooks: never,
  messenger: Messenger<string, ResolveInterfaceMethodActions>,
): Promise<void> {
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

    const { id, value } = validatedParams;

    await messenger.call(
      'SnapInterfaceController:resolveInterface',
      origin,
      id,
      value,
    );
    res.result = null;
  } catch (error) {
    return end(error);
  }

  return end();
}

/**
 * Validate the resolveInterface method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated resolveInterface method parameter object.
 */
function getValidatedParams(params: unknown): ResolveInterfaceParameters {
  try {
    return create(params, ResolveInterfaceParametersStruct);
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
