import type {
  JsonRpcEngineEndCallback,
  MethodHandler,
} from '@metamask/json-rpc-engine';
import type { Messenger } from '@metamask/messenger';
import type { PermissionControllerHasPermissionAction } from '@metamask/permission-controller';
import { providerErrors, rpcErrors } from '@metamask/rpc-errors';
import type {
  CloseWebSocketParams,
  CloseWebSocketResult,
} from '@metamask/snaps-sdk';
import type { InferMatching } from '@metamask/snaps-utils';
import { create, object, string, StructError } from '@metamask/superstruct';
import type { PendingJsonRpcResponse } from '@metamask/utils';

import { SnapEndowments } from '../endowments';
import type {
  JsonRpcRequestWithOrigin,
  WebSocketServiceCloseAction,
} from '../types';

export type CloseWebSocketMethodActions =
  | PermissionControllerHasPermissionAction
  | WebSocketServiceCloseAction;

const CloseWebSocketParametersStruct = object({
  id: string(),
});

export type CloseWebSocketParameters = InferMatching<
  typeof CloseWebSocketParametersStruct,
  CloseWebSocketParams
>;

/**
 * Closes a WebSocket connection that was previously opened with
 * [`snap_openWebSocket`](https://docs.metamask.io/snaps/reference/snaps-api/snap_openwebsocket).
 *
 * @example
 * ```json name="Manifest"
 * {
 *   "initialPermissions": {
 *     "endowment:network-access": {}
 *   }
 * }
 * ```
 * ```ts name="Usage"
 * await snap.request({
 *   method: 'snap_closeWebSocket',
 *   params: { id: 'websocket-1' },
 * });
 * ```
 */
export const closeWebSocketHandler = {
  implementation: closeWebSocketImplementation,
  actionNames: ['PermissionController:hasPermission', 'WebSocketService:close'],
} satisfies MethodHandler<
  never,
  CloseWebSocketMethodActions,
  CloseWebSocketParams,
  CloseWebSocketResult,
  { origin: string }
>;

/**
 * The `snap_closeWebSocket` method implementation.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param _hooks - The RPC method hooks. Not used by this function.
 * @param messenger - The messenger used to call controller actions.
 * @returns Nothing.
 */
function closeWebSocketImplementation(
  req: JsonRpcRequestWithOrigin<CloseWebSocketParameters>,
  res: PendingJsonRpcResponse<CloseWebSocketResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  _hooks: never,
  messenger: Messenger<string, CloseWebSocketMethodActions>,
): void {
  const { params, origin } = req;

  if (
    !messenger.call(
      'PermissionController:hasPermission',
      origin,
      SnapEndowments.NetworkAccess,
    )
  ) {
    return end(providerErrors.unauthorized());
  }

  try {
    const { id } = getValidatedParams(params);
    messenger.call('WebSocketService:close', origin, id);
    res.result = null;
  } catch (error) {
    return end(error);
  }

  return end();
}

/**
 * Validates the parameters for the snap_closeWebSocket method.
 *
 * @param params - Parameters to validate.
 * @returns Validated parameters.
 * @throws Throws RPC error if validation fails.
 */
function getValidatedParams(params: unknown): CloseWebSocketParameters {
  try {
    return create(params, CloseWebSocketParametersStruct);
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
