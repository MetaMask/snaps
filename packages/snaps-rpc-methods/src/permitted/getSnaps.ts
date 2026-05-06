import type {
  JsonRpcEngineEndCallback,
  MethodHandler,
} from '@metamask/json-rpc-engine';
import type { Messenger } from '@metamask/messenger';
import type { GetSnapsResult } from '@metamask/snaps-sdk';
import type {
  JsonRpcParams,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from '@metamask/utils';

import type { SnapControllerGetPermittedSnapsAction } from '../types';

export type GetSnapsMethodActions = SnapControllerGetPermittedSnapsAction;

/**
 * Get permitted and installed Snaps for the requesting origin.
 *
 * @example
 * ```ts
 * const snaps = await snap.request({
 *   method: 'wallet_getSnaps',
 * });
 * console.log(snaps);
 * // {
 * //   'npm:example-snap': {
 * //     id: 'npm:example-snap',
 * //     version: '1.0.0',
 * //     initialPermissions: { ... },
 * //     blocked: false,
 * //     enabled: true,
 * //   },
 * //   ...,
 * // }
 * ```
 */
export const getSnapsHandler = {
  implementation: getSnapsImplementation,
  actionNames: ['SnapController:getPermittedSnaps'],
} satisfies MethodHandler<
  never,
  GetSnapsMethodActions,
  JsonRpcParams,
  GetSnapsResult,
  { origin: string }
>;

/**
 * The `wallet_getSnaps` method implementation.
 * Fetches available snaps for the requesting origin and adds them to the JSON-RPC response.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param _hooks - The RPC method hooks. Not used by this function.
 * @param messenger - The messenger used to call controller actions.
 * @returns Nothing.
 */
async function getSnapsImplementation(
  req: JsonRpcRequest & { origin: string },
  res: PendingJsonRpcResponse<GetSnapsResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  _hooks: Record<string, never>,
  messenger: Messenger<string, GetSnapsMethodActions>,
): Promise<void> {
  res.result = messenger.call('SnapController:getPermittedSnaps', req.origin);
  return end();
}
