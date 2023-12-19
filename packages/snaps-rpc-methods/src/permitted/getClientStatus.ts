import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import type { GetClientStatusResult } from '@metamask/snaps-sdk';
import type {
  JsonRpcParams,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from '@metamask/utils';

import type { MethodHooksObject } from '../utils';

const hookNames: MethodHooksObject<GetClientStatusHooks> = {
  getIsLocked: true,
};

/**
 * `snap_getClientStatus` returns useful information about the client running the snap.
 */
export const getClientStatusHandler: PermittedHandlerExport<
  GetClientStatusHooks,
  JsonRpcParams,
  GetClientStatusResult
> = {
  methodNames: ['snap_getClientStatus'],
  implementation: getClientStatusImplementation,
  hookNames,
};

export type GetClientStatusHooks = {
  /**
   * @returns Whether the client is locked or not.
   */
  getIsLocked: () => boolean;
};

/**
 * The `snap_getClientStatus` method implementation.
 * Returns useful information about the client running the snap.
 *
 * @param _request - The JSON-RPC request object. Not used by this function.
 * @param response - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.getIsLocked - A function that returns whether the client is locked or not.
 * @returns Nothing.
 */
async function getClientStatusImplementation(
  _request: JsonRpcRequest,
  response: PendingJsonRpcResponse<GetClientStatusResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { getIsLocked }: GetClientStatusHooks,
): Promise<void> {
  response.result = { locked: getIsLocked() };
  return end();
}
