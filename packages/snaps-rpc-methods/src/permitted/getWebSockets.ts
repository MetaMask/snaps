import type {
  JsonRpcEngineEndCallback,
  MethodHandler,
} from '@metamask/json-rpc-engine';
import type { Messenger } from '@metamask/messenger';
import type { PermissionControllerHasPermissionAction } from '@metamask/permission-controller';
import { providerErrors } from '@metamask/rpc-errors';
import type {
  GetWebSocketsParams,
  GetWebSocketsResult,
} from '@metamask/snaps-sdk';
import type { PendingJsonRpcResponse } from '@metamask/utils';

import { SnapEndowments } from '../endowments';
import type {
  JsonRpcRequestWithOrigin,
  WebSocketServiceGetAllAction,
} from '../types';

export type GetWebSocketsMethodActions =
  | PermissionControllerHasPermissionAction
  | WebSocketServiceGetAllAction;

/**
 * Get the connected WebSockets for the Snap.
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
 * const webSockets = await snap.request({ method: 'snap_getWebSockets' });
 * console.log(webSockets);
 * // Example output:
 * // [
 * //   {
 * //     id: 'websocket-1',
 * //     url: 'wss://example.com/socket',
 * //     protocols: ['protocol1', 'protocol2'],
 * //   },
 * //   {
 * //     id: 'websocket-2',
 * //     url: 'ws://example.org/endpoint',
 * //     protocols: [],
 * //   },
 * // ]
 * ```
 */
export const getWebSocketsHandler = {
  implementation: getWebSocketsImplementation,
  actionNames: [
    'PermissionController:hasPermission',
    'WebSocketService:getAll',
  ],
} satisfies MethodHandler<
  never,
  GetWebSocketsMethodActions,
  GetWebSocketsParams,
  GetWebSocketsResult,
  { origin: string }
>;

/**
 * The `snap_getWebSockets` method implementation.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param _hooks - The RPC method hooks. Not used by this function.
 * @param messenger - The messenger used to call controller actions.
 * @returns Nothing.
 */
function getWebSocketsImplementation(
  req: JsonRpcRequestWithOrigin<GetWebSocketsParams>,
  res: PendingJsonRpcResponse<GetWebSocketsResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  _hooks: never,
  messenger: Messenger<string, GetWebSocketsMethodActions>,
): void {
  const { origin } = req;

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
    res.result = messenger.call('WebSocketService:getAll', origin);
  } catch (error) {
    return end(error);
  }

  return end();
}
