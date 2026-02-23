import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { providerErrors, rpcErrors } from '@metamask/rpc-errors';
import {
  literal,
  union,
  type JsonRpcRequest,
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
import type { MethodHooksObject } from '../utils';

const methodName = 'snap_openWebSocket';

const hookNames: MethodHooksObject<OpenWebSocketMethodHooks> = {
  hasPermission: true,
  openWebSocket: true,
};

export type OpenWebSocketMethodHooks = {
  hasPermission: (permissionName: string) => boolean;
  openWebSocket: (url: string, protocols?: string[]) => Promise<string>;
};

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
  methodNames: [methodName] as const,
  implementation: openWebSocketImplementation,
  hookNames,
} satisfies PermittedHandlerExport<
  OpenWebSocketMethodHooks,
  OpenWebSocketParams,
  OpenWebSocketResult
>;

/**
 * The `snap_openWebSocket` method implementation.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.hasPermission - The function to check if a snap has the `endowment:network-access` permission.
 * @param hooks.openWebSocket - The function to open a WebSocket.
 * @returns Nothing.
 */
async function openWebSocketImplementation(
  req: JsonRpcRequest<OpenWebSocketParameters>,
  res: PendingJsonRpcResponse<OpenWebSocketResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { hasPermission, openWebSocket }: OpenWebSocketMethodHooks,
): Promise<void> {
  if (!hasPermission(SnapEndowments.NetworkAccess)) {
    return end(providerErrors.unauthorized());
  }

  const { params } = req;

  try {
    const { url, protocols } = getValidatedParams(params);
    res.result = await openWebSocket(url, protocols);
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
