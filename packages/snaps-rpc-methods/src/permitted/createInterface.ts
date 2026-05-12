import type {
  JsonRpcEngineEndCallback,
  MethodHandler,
} from '@metamask/json-rpc-engine';
import type { Messenger } from '@metamask/messenger';
import type { PermissionControllerHasPermissionAction } from '@metamask/permission-controller';
import { providerErrors, rpcErrors } from '@metamask/rpc-errors';
import type {
  CreateInterfaceParams,
  CreateInterfaceResult,
} from '@metamask/snaps-sdk';
import {
  ComponentOrElementStruct,
  InterfaceContextStruct,
} from '@metamask/snaps-sdk';
import { type InferMatching } from '@metamask/snaps-utils';
import { StructError, create, object, optional } from '@metamask/superstruct';
import type { PendingJsonRpcResponse } from '@metamask/utils';

import type {
  JsonRpcRequestWithOrigin,
  SnapInterfaceControllerCreateInterfaceAction,
} from '../types';
import { UI_PERMISSIONS } from '../utils';

export type CreateInterfaceMethodActions =
  | PermissionControllerHasPermissionAction
  | SnapInterfaceControllerCreateInterfaceAction;

/**
 * Create the interactive interface for use in the
 * [interactive UI](https://docs.metamask.io/snaps/features/custom-ui/interactive-ui/).
 *
 * @example
 * ```tsx
 * import { Box, Heading, Text } from '@metamask/snaps-sdk/jsx';
 *
 * const interfaceId = snap.request({
 *   method: 'snap_createInterface',
 *   params: {
 *     ui: (
 *       <Box>
 *         <Heading>Example Interface</Heading>
 *         <Text>This is an example interface created by "snap_createInterface".</Text>
 *       </Box>
 *     ),
 *   },
 * });
 * ```
 */
export const createInterfaceHandler = {
  implementation: getCreateInterfaceImplementation,
  actionNames: [
    'PermissionController:hasPermission',
    'SnapInterfaceController:createInterface',
  ],
} satisfies MethodHandler<
  never,
  CreateInterfaceMethodActions,
  CreateInterfaceParameters,
  CreateInterfaceResult,
  { origin: string }
>;

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
 * @param _hooks - The RPC method hooks. Not used by this function.
 * @param messenger - The messenger used to call controller actions.
 * @returns Nothing.
 */
function getCreateInterfaceImplementation(
  req: JsonRpcRequestWithOrigin<CreateInterfaceParameters>,
  res: PendingJsonRpcResponse<CreateInterfaceResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  _hooks: never,
  messenger: Messenger<string, CreateInterfaceMethodActions>,
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

    const { ui, context } = validatedParams;

    res.result = messenger.call(
      'SnapInterfaceController:createInterface',
      origin,
      ui,
      context,
    );
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
