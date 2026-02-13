import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import type { GetClientStatusResult } from '@metamask/snaps-sdk';
import { getPlatformVersion } from '@metamask/snaps-utils';
import type {
  JsonRpcParams,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from '@metamask/utils';

import type { MethodHooksObject } from '../utils';

const methodName = 'snap_getClientStatus';

const hookNames: MethodHooksObject<GetClientStatusHooks> = {
  getIsLocked: true,
  getIsActive: true,
  getVersion: true,
};

/**
 * `snap_getClientStatus` returns useful information about the client running the snap.
 */
export const getClientStatusHandler = {
  methodNames: [methodName] as const,
  implementation: getClientStatusImplementation,
  hookNames,
} satisfies PermittedHandlerExport<
  GetClientStatusHooks,
  JsonRpcParams,
  GetClientStatusResult
>;

export type GetClientStatusHooks = {
  /**
   * @returns Whether the client is locked or not.
   */
  getIsLocked: () => boolean;

  /**
   * @returns Whether the client is active or not.
   */
  getIsActive: () => boolean;

  /**
   * @returns The version string for the client.
   */
  getVersion: () => string;
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
 * @param hooks.getIsActive - A function that returns whether the client is opened or not.
 * @param hooks.getVersion - A function that returns the client version.
 * @returns Nothing.
 */
async function getClientStatusImplementation(
  _request: JsonRpcRequest,
  response: PendingJsonRpcResponse<GetClientStatusResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { getIsLocked, getIsActive, getVersion }: GetClientStatusHooks,
): Promise<void> {
  response.result = {
    locked: getIsLocked(),
    active: getIsActive(),
    clientVersion: getVersion(),
    platformVersion: getPlatformVersion(),
  };
  return end();
}
