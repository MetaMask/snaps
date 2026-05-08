import type {
  JsonRpcEngineEndCallback,
  MethodHandler,
} from '@metamask/json-rpc-engine';
import type { Messenger } from '@metamask/messenger';
import type { PermissionControllerHasPermissionAction } from '@metamask/permission-controller';
import { providerErrors, rpcErrors } from '@metamask/rpc-errors';
import type {
  UpdateInterfaceParams,
  UpdateInterfaceResult,
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

import type {
  JsonRpcRequestWithOrigin,
  SnapInterfaceControllerUpdateInterfaceAction,
} from '../types';
import { UI_PERMISSIONS } from '../utils';

export type UpdateInterfaceMethodActions =
  | PermissionControllerHasPermissionAction
  | SnapInterfaceControllerUpdateInterfaceAction;

/**
 * Update an interactive interface. For use in
 * [interactive UI](https://docs.metamask.io/snaps/features/custom-ui/interactive-ui/).
 *
 * @example
 * ```tsx
 * import { Box, Heading, Text } from '@metamask/snaps-sdk/jsx';
 *
 * // First, create an interface and get its ID.
 * const id = await snap.request({
 *   method: 'snap_createInterface',
 *   params: {
 *     ui: (
 *       <Box>
 *         ...
 *       </Box>
 *     ),
 *   },
 * });
 *
 * // Later, update the interface with new content using the ID.
 * snap.request({
 *   method: 'snap_updateInterface',
 *   params: {
 *     id: 'interface-id',
 *     ui: (
 *       <Box>
 *         <Heading>Updated Interface</Heading>
 *         <Text>This interface has been updated.</Text>
 *       </Box>
 *     ),
 *   },
 * });
 * ```
 */
export const updateInterfaceHandler = {
  implementation: getUpdateInterfaceImplementation,
  actionNames: [
    'PermissionController:hasPermission',
    'SnapInterfaceController:updateInterface',
  ],
} satisfies MethodHandler<
  never,
  UpdateInterfaceMethodActions,
  UpdateInterfaceParameters,
  UpdateInterfaceResult,
  { origin: string }
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
 * @param _hooks - The RPC method hooks. Not used by this function.
 * @param messenger - The messenger used to call controller actions.
 * @returns Nothing.
 */
function getUpdateInterfaceImplementation(
  req: JsonRpcRequestWithOrigin<UpdateInterfaceParameters>,
  res: PendingJsonRpcResponse<UpdateInterfaceResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  _hooks: never,
  messenger: Messenger<string, UpdateInterfaceMethodActions>,
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

    const { id, ui, context } = validatedParams;

    messenger.call(
      'SnapInterfaceController:updateInterface',
      origin,
      id,
      ui,
      context,
    );
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
