import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { providerErrors, rpcErrors } from '@metamask/rpc-errors';
import type {
  JsonRpcRequest,
  CloseWebSocketParams,
  CloseWebSocketResult,
} from '@metamask/snaps-sdk';
import type { InferMatching } from '@metamask/snaps-utils';
import { create, object, string, StructError } from '@metamask/superstruct';
import type { PendingJsonRpcResponse } from '@metamask/utils';

import { SnapEndowments } from '../endowments';
import type { MethodHooksObject } from '../utils';

const hookNames: MethodHooksObject<CloseWebSocketMethodHooks> = {
  hasPermission: true,
  closeWebSocket: true,
};

export type CloseWebSocketMethodHooks = {
  hasPermission: (permissionName: string) => boolean;
  closeWebSocket: (id: string) => void;
};

const CloseWebSocketParametersStruct = object({
  id: string(),
});

export type CloseWebSocketParameters = InferMatching<
  typeof CloseWebSocketParametersStruct,
  CloseWebSocketParams
>;

/**
 * Handler for the `snap_closeWebSocket` method.
 */
export const closeWebSocketHandler: PermittedHandlerExport<
  CloseWebSocketMethodHooks,
  CloseWebSocketParams,
  CloseWebSocketResult
> = {
  methodNames: ['snap_closeWebSocket'],
  implementation: closeWebSocketImplementation,
  hookNames,
};

/**
 * The `snap_closeWebSocket` method implementation.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.hasPermission - The function to check if a snap has the `endowment:network-access` permission.
 * @param hooks.closeWebSocket - The function to close a WebSocket.
 * @returns Nothing.
 */
function closeWebSocketImplementation(
  req: JsonRpcRequest<CloseWebSocketParameters>,
  res: PendingJsonRpcResponse<CloseWebSocketResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { hasPermission, closeWebSocket }: CloseWebSocketMethodHooks,
): void {
  if (!hasPermission(SnapEndowments.NetworkAccess)) {
    return end(providerErrors.unauthorized());
  }

  const { params } = req;

  try {
    const { id } = getValidatedParams(params);
    closeWebSocket(id);
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
