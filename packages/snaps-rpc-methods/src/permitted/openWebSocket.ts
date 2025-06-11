import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { providerErrors, rpcErrors } from '@metamask/rpc-errors';
import type {
  JsonRpcRequest,
  OpenWebSocketParams,
  OpenWebSocketResult,
} from '@metamask/snaps-sdk';
import type { InferMatching } from '@metamask/snaps-utils';
import {
  create,
  object,
  array,
  string,
  StructError,
} from '@metamask/superstruct';
import type { PendingJsonRpcResponse } from '@metamask/utils';

import { SnapEndowments } from '../endowments';
import type { MethodHooksObject } from '../utils';

const hookNames: MethodHooksObject<OpenWebSocketMethodHooks> = {
  hasPermission: true,
  openWebSocket: true,
};

export type OpenWebSocketMethodHooks = {
  hasPermission: (permissionName: string) => boolean;
  openWebSocket: (url: string, protocols?: string[]) => string;
};

const OpenWebSocketParametersStruct = object({
  url: string(),
  protocols: array(string()),
});

export type OpenWebSocketParameters = InferMatching<
  typeof OpenWebSocketParametersStruct,
  OpenWebSocketParams
>;

/**
 * Handler for the `snap_openWebSocket` method.
 */
export const openWebSocketHandler: PermittedHandlerExport<
  OpenWebSocketMethodHooks,
  OpenWebSocketParams,
  OpenWebSocketResult
> = {
  methodNames: ['snap_openWebSocket'],
  implementation: openWebSocketImplementation,
  hookNames,
};

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
function openWebSocketImplementation(
  req: JsonRpcRequest<OpenWebSocketParameters>,
  res: PendingJsonRpcResponse<OpenWebSocketResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { hasPermission, openWebSocket }: OpenWebSocketMethodHooks,
): void {
  if (!hasPermission(SnapEndowments.NetworkAccess)) {
    return end(providerErrors.unauthorized());
  }

  const { params } = req;

  try {
    const { url, protocols } = getValidatedParams(params);
    res.result = openWebSocket(url, protocols);
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
