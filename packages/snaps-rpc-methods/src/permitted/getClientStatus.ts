import type {
  JsonRpcEngineEndCallback,
  MethodHandler,
} from '@metamask/json-rpc-engine';
import type { Messenger } from '@metamask/messenger';
import type { GetClientStatusResult } from '@metamask/snaps-sdk';
import { getPlatformVersion } from '@metamask/snaps-utils';
import type {
  JsonRpcParams,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from '@metamask/utils';

import type { KeyringControllerGetStateAction } from '../types';
import type { MethodHooksObject } from '../utils';

const hookNames: MethodHooksObject<GetClientStatusMethodHooks> = {
  getIsActive: true,
  getVersion: true,
};

export type GetClientStatusMethodHooks = {
  /**
   * @returns Whether the client is active or not.
   */
  getIsActive: () => boolean;

  /**
   * @returns The version string for the client.
   */
  getVersion: () => string;
};

export type GetClientStatusMethodActions = KeyringControllerGetStateAction;

/**
 * Get the status of the client running the Snap.
 *
 * @example
 * ```ts
 * import type { OnCronjobHandler } from '@metamask/snaps-sdk'
 * import { MethodNotFoundError } from '@metamask/snaps-sdk'
 *
 * export const onCronjob: OnCronjobHandler = async ({ request }) => {
 *   switch (request.method) {
 *     case 'execute':
 *       // Find out if MetaMask is locked.
 *       const { locked } = await snap.request({
 *         method: 'snap_getClientStatus',
 *       })
 *
 *       if (!locked) {
 *         // Do something that requires MetaMask to be unlocked, such as
 *         // accessing the encrypted state.
 *       }
 *
 *     default:
 *       throw new MethodNotFoundError()
 *   }
 * }
 * ```
 */
export const getClientStatusHandler = {
  implementation: getClientStatusImplementation,
  hookNames,
  actionNames: ['KeyringController:getState'],
} satisfies MethodHandler<
  GetClientStatusMethodHooks,
  GetClientStatusMethodActions,
  JsonRpcParams,
  GetClientStatusResult
>;

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
 * @param hooks.getIsActive - A function that returns whether the client is opened or not.
 * @param hooks.getVersion - A function that returns the client version.
 * @param messenger - The messenger used to call controller actions.
 * @returns Nothing.
 */
async function getClientStatusImplementation(
  _request: JsonRpcRequest,
  response: PendingJsonRpcResponse<GetClientStatusResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { getIsActive, getVersion }: GetClientStatusMethodHooks,
  messenger: Messenger<string, GetClientStatusMethodActions>,
): Promise<void> {
  const { isUnlocked } = messenger.call('KeyringController:getState');

  response.result = {
    locked: !isUnlocked,
    active: getIsActive(),
    clientVersion: getVersion(),
    platformVersion: getPlatformVersion(),
  };
  return end();
}
