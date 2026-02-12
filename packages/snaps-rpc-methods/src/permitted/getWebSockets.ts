import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { providerErrors } from '@metamask/rpc-errors';
import type {
  GetWebSocketsParams,
  GetWebSocketsResult,
  JsonRpcRequest,
} from '@metamask/snaps-sdk';
import type { PendingJsonRpcResponse } from '@metamask/utils';

import { SnapEndowments } from '../endowments';
import type { MethodHooksObject } from '../utils';

const methodName = 'snap_getWebSockets';

const hookNames: MethodHooksObject<GetWebSocketsMethodHooks> = {
  hasPermission: true,
  getWebSockets: true,
};

export type GetWebSocketsMethodHooks = {
  hasPermission: (permissionName: string) => boolean;
  getWebSockets: () => GetWebSocketsResult;
};

/**
 * Handler for the `snap_getWebSockets` method.
 */
export const getWebSocketsHandler = {
  methodNames: [methodName] as const,
  implementation: getWebSocketsImplementation,
  hookNames,
} satisfies PermittedHandlerExport<
  GetWebSocketsMethodHooks,
  GetWebSocketsParams,
  GetWebSocketsResult
>;

/**
 * The `snap_getWebSockets` method implementation.
 *
 * @param _req - The JSON-RPC request object. Not used by this function.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.hasPermission - The function to check if a snap has the `endowment:network-access` permission.
 * @param hooks.getWebSockets - The function to get the connected WebSockets for the origin.
 * @returns Nothing.
 */
function getWebSocketsImplementation(
  _req: JsonRpcRequest<GetWebSocketsParams>,
  res: PendingJsonRpcResponse<GetWebSocketsResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { hasPermission, getWebSockets }: GetWebSocketsMethodHooks,
): void {
  if (!hasPermission(SnapEndowments.NetworkAccess)) {
    return end(providerErrors.unauthorized());
  }

  try {
    res.result = getWebSockets();
  } catch (error) {
    return end(error);
  }

  return end();
}
