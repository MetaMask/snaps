import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
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
import type { MethodHooksObject } from '../utils';

const hookNames: MethodHooksObject<SendWebSocketMessageMethodHooks> = {
  hasPermission: true,
  sendWebSocketMessage: true,
};

export type SendWebSocketMessageMethodHooks = {
  hasPermission: (permissionName: string) => boolean;
  sendWebSocketMessage: (id: string, data: string | number[]) => void;
};

const SendWebSocketMessageParametersStruct = object({
  id: string(),
  message: union([string(), array(number())]),
});

export type SendWebSocketMessageParameters = InferMatching<
  typeof SendWebSocketMessageParametersStruct,
  SendWebSocketMessageParams
>;

/**
 * Handler for the `snap_sendWebSocketMessage` method.
 */
export const sendWebSocketMessageHandler: PermittedHandlerExport<
  SendWebSocketMessageMethodHooks,
  SendWebSocketMessageParams,
  SendWebSocketMessageResult
> = {
  methodNames: ['snap_sendWebSocketMessage'],
  implementation: sendWebSocketMessageImplementation,
  hookNames,
};

/**
 * The `snap_sendWebSocketMessage` method implementation.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.hasPermission - The function to check if a snap has the `endowment:network-access` permission.
 * @param hooks.sendWebSocketMessage - The function to send a WebSocket message.
 * @returns Nothing.
 */
function sendWebSocketMessageImplementation(
  req: JsonRpcRequest<SendWebSocketMessageParameters>,
  res: PendingJsonRpcResponse<SendWebSocketMessageResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { hasPermission, sendWebSocketMessage }: SendWebSocketMessageMethodHooks,
): void {
  if (!hasPermission(SnapEndowments.NetworkAccess)) {
    return end(providerErrors.unauthorized());
  }

  const { params } = req;

  try {
    const { id, message } = getValidatedParams(params);
    sendWebSocketMessage(id, message);
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
