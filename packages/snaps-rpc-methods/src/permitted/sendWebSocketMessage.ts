import type {
  JsonRpcEngineEndCallback,
  MethodHandler,
} from '@metamask/json-rpc-engine';
import type { Messenger } from '@metamask/messenger';
import type { PermissionControllerHasPermissionAction } from '@metamask/permission-controller';
import { providerErrors, rpcErrors } from '@metamask/rpc-errors';
import type {
  JsonRpcRequest,
  SendWebSocketMessageParams,
  SendWebSocketMessageResult,
} from '@metamask/snaps-sdk';
import { union } from '@metamask/snaps-sdk';
import type { InferMatching } from '@metamask/snaps-utils';
import {
  create,
  object,
  number,
  string,
  array,
  StructError,
} from '@metamask/superstruct';
import type { PendingJsonRpcResponse } from '@metamask/utils';

import { SnapEndowments } from '../endowments';
import type { WebSocketServiceSendMessageAction } from '../types';

export type SendWebSocketMessageMethodActions =
  | PermissionControllerHasPermissionAction
  | WebSocketServiceSendMessageAction;

const SendWebSocketMessageParametersStruct = object({
  id: string(),
  message: union([string(), array(number())]),
});

export type SendWebSocketMessageParameters = InferMatching<
  typeof SendWebSocketMessageParametersStruct,
  SendWebSocketMessageParams
>;

/**
 * Send a message to an open WebSocket connection. The message will be sent to
 * the WebSocket connection with the specified ID, which must have been
 * previously opened by the Snap using the [`snap_openWebSocket`](https://docs.metamask.io/snaps/reference/snaps-api/snap_openwebsocket/)
 * method.
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
 * await wallet.request({
 *   method: 'snap_sendWebSocketMessage',
 *   params: {
 *     id: 'websocket-connection-id',
 *     message: 'Hello, WebSocket!', // or message: [1, 2, 3] for binary data
 *   },
 * });
 * ```
 */
export const sendWebSocketMessageHandler = {
  implementation: sendWebSocketMessageImplementation,
  actionNames: [
    'PermissionController:hasPermission',
    'WebSocketService:sendMessage',
  ],
} satisfies MethodHandler<
  never,
  SendWebSocketMessageMethodActions,
  SendWebSocketMessageParams,
  SendWebSocketMessageResult,
  { origin: string }
>;

/**
 * The `snap_sendWebSocketMessage` method implementation.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param _hooks - The RPC method hooks. Not used by this function.
 * @param messenger - The messenger used to call controller actions.
 * @returns Nothing.
 */
async function sendWebSocketMessageImplementation(
  req: JsonRpcRequest<SendWebSocketMessageParameters> & { origin: string },
  res: PendingJsonRpcResponse<SendWebSocketMessageResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  _hooks: Record<string, never>,
  messenger: Messenger<string, SendWebSocketMessageMethodActions>,
): Promise<void> {
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
    const { id, message } = getValidatedParams(params);
    await messenger.call('WebSocketService:sendMessage', origin, id, message);
    res.result = null;
  } catch (error) {
    return end(error);
  }

  return end();
}

/**
 * Validates the parameters for the snap_sendWebSocketMessage method.
 *
 * @param params - Parameters to validate.
 * @returns Validated parameters.
 * @throws Throws RPC error if validation fails.
 */
function getValidatedParams(params: unknown): SendWebSocketMessageParameters {
  try {
    return create(params, SendWebSocketMessageParametersStruct);
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
