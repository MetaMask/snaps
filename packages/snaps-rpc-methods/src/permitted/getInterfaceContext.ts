import type {
  JsonRpcEngineEndCallback,
  MethodHandler,
} from '@metamask/json-rpc-engine';
import type { Messenger } from '@metamask/messenger';
import type { PermissionControllerHasPermissionAction } from '@metamask/permission-controller';
import { providerErrors, rpcErrors } from '@metamask/rpc-errors';
import type {
  GetInterfaceContextParams,
  GetInterfaceContextResult,
  JsonRpcRequest,
} from '@metamask/snaps-sdk';
import { type InferMatching } from '@metamask/snaps-utils';
import { StructError, create, object, string } from '@metamask/superstruct';
import type { PendingJsonRpcResponse } from '@metamask/utils';

import type { SnapInterfaceControllerGetInterfaceAction } from '../types';
import { UI_PERMISSIONS } from '../utils';

export type GetInterfaceContextMethodActions =
  | PermissionControllerHasPermissionAction
  | SnapInterfaceControllerGetInterfaceAction;

/**
 * Get the context of an [interface](https://docs.metamask.io/snaps/features/custom-ui/interactive-ui/)
 * created by [`snap_createInterface`](https://docs.metamask.io/snaps/reference/snaps-api/snap_createinterface).
 *
 * @example
 * ```ts
 * import { Box, Heading, Text } from '@metamask/snaps-sdk/jsx';
 *
 * const interfaceId = await snap.request({
 *   method: 'snap_createInterface',
 *   params: {
 *     ui: (
 *       <Box>
 *         <Heading>Hello, world!</Heading>
 *         <Text>Welcome to my Snap homepage!</Text>
 *       </Box>
 *     ),
 *     context: {
 *       key: 'value'
 *     }
 *   },
 * })
 *
 * const context = await snap.request({
 *   method: 'snap_getInterfaceContext',
 *   params: {
 *     id: interfaceId,
 *   },
 * })
 *
 * console.log(context)
 * // {
 * //   key: 'value'
 * // }
 * ```
 */
export const getInterfaceContextHandler = {
  implementation: getInterfaceContextImplementation,
  actionNames: [
    'PermissionController:hasPermission',
    'SnapInterfaceController:getInterface',
  ],
} satisfies MethodHandler<
  never,
  GetInterfaceContextMethodActions,
  GetInterfaceContextParameters,
  GetInterfaceContextResult,
  { origin: string }
>;

const GetInterfaceContextParametersStruct = object({
  id: string(),
});

export type GetInterfaceContextParameters = InferMatching<
  typeof GetInterfaceContextParametersStruct,
  GetInterfaceContextParams
>;

/**
 * The `snap_getInterfaceContext` method implementation.
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
function getInterfaceContextImplementation(
  req: JsonRpcRequest<GetInterfaceContextParameters> & { origin: string },
  res: PendingJsonRpcResponse<GetInterfaceContextResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  _hooks: Record<string, never>,
  messenger: Messenger<string, GetInterfaceContextMethodActions>,
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

    const { id } = validatedParams;

    const { context } = messenger.call(
      'SnapInterfaceController:getInterface',
      origin,
      id,
    );
    res.result = context;
  } catch (error) {
    return end(error);
  }

  return end();
}

/**
 * Validate the getInterfaceContext method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated getInterfaceContext method parameter object.
 */
function getValidatedParams(params: unknown): GetInterfaceContextParameters {
  try {
    return create(params, GetInterfaceContextParametersStruct);
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
