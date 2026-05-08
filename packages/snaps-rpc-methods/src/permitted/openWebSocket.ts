import type {
  JsonRpcEngineEndCallback,
  MethodHandler,
} from '@metamask/json-rpc-engine';
import type { Messenger } from '@metamask/messenger';
import type { PermissionControllerHasPermissionAction } from '@metamask/permission-controller';
import { providerErrors, rpcErrors } from '@metamask/rpc-errors';
import {
  literal,
  union,
  type OpenWebSocketParams,
  type OpenWebSocketResult,
} from '@metamask/snaps-sdk';
import { uri, type InferMatching } from '@metamask/snaps-utils';
import {
  create,
  object,
  array,
  string,
  optional,
  StructError,
} from '@metamask/superstruct';
import type { PendingJsonRpcResponse } from '@metamask/utils';

import { SnapEndowments } from '../endowments';
import type {
  JsonRpcRequestWithOrigin,
  WebSocketServiceOpenAction,
} from '../types';

export type OpenWebSocketMethodActions =
  | PermissionControllerHasPermissionAction
  | WebSocketServiceOpenAction;

const OpenWebSocketParametersStruct = object({
  url: uri({ protocol: union([literal('wss:'), literal('ws:')]) }),
  protocols: optional(array(string())),
});

export type OpenWebSocketParameters = InferMatching<
  typeof OpenWebSocketParametersStruct,
  OpenWebSocketParams
>;

/**
 * Open a WebSocket connection to the specified URL with optional protocols.
 *
 * Note: This method is only available to snaps that have the
 * [`endowment:network-access`](https://docs.metamask.io/snaps/features/network-access/)
 * permission.
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
 * // Open a connection to a WebSocket server, e.g., in the JSON-RPC handler of
 * // the Snap:
 * snap.request({
 *   method: 'snap_openWebSocket',
 *   params: {
 *     url: 'wss://example.com/socket',
 *     protocols: ['protocol1', 'protocol2'], // Optional
 *   },
 * });
 *
 * // Listen for events from the WebSocket connection in the `onWebSocketEvent`
 * // handler of the Snap:
 * export const onWebSocketEvent: OnWebSocketEventHandler = async ({ event }) => {
 *   switch (event.type) {
 *     case 'open':
 *       console.log(`WebSocket connection opened with origin ${event.origin}`);
 *       break;
 *     case 'message':
 *       console.log(`WebSocket message received from origin ${event.origin}:`, event.data);
 *       break;
 *     case 'close':
 *       console.log(`WebSocket connection closed with origin ${event.origin}`);
 *       break;
 *     case 'error':
 *       console.error(`WebSocket error from origin ${event.origin}:`, event.error);
 *       break;
 *   }
 * };
 * ```
 */
export const openWebSocketHandler = {
  implementation: openWebSocketImplementation,
  actionNames: ['PermissionController:hasPermission', 'WebSocketService:open'],
} satisfies MethodHandler<
  never,
  OpenWebSocketMethodActions,
  OpenWebSocketParams,
  OpenWebSocketResult,
  { origin: string }
>;

/**
 * The `snap_openWebSocket` method implementation.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param _hooks - The RPC method hooks. Not used by this function.
 * @param messenger - The messenger used to call controller actions.
 * @returns Nothing.
 */
async function openWebSocketImplementation(
  req: JsonRpcRequestWithOrigin<OpenWebSocketParameters>,
  res: PendingJsonRpcResponse<OpenWebSocketResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  _hooks: never,
  messenger: Messenger<string, OpenWebSocketMethodActions>,
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
    const { url, protocols } = getValidatedParams(params);
    res.result = await messenger.call(
      'WebSocketService:open',
      origin,
      url,
      protocols,
    );
  } catch (error) {
    return end(error);
  }

  return end();
}

/**
 * Validates the parameters for the snap_openWebSocket method.
 *
 * @param params - Parameters to validate.
 * @returns Validated parameters.
 * @throws Throws RPC error if validation fails.
 */
function getValidatedParams(params: unknown): OpenWebSocketParameters {
  try {
    return create(params, OpenWebSocketParametersStruct);
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
