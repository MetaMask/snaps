import type {
  JsonRpcEngineEndCallback,
  MethodHandler,
} from '@metamask/json-rpc-engine';
import type { Messenger } from '@metamask/messenger';
import { rpcErrors } from '@metamask/rpc-errors';
import type { TruncatedSnap } from '@metamask/snaps-utils';
import type {
  JsonRpcParams,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from '@metamask/utils';

import type { SnapControllerGetAllSnapsAction } from '../types';

export type GetAllSnapsResult = TruncatedSnap[];

export type GetAllSnapsMethodActions = SnapControllerGetAllSnapsAction;

/**
 * `wallet_getAllSnaps` gets all installed Snaps. Currently, this can only be
 * called from `https://snaps.metamask.io`.
 *
 * @internal
 */
export const getAllSnapsHandler = {
  implementation: getAllSnapsImplementation,
  actionNames: ['SnapController:getAllSnaps'],
} satisfies MethodHandler<
  never,
  GetAllSnapsMethodActions,
  JsonRpcParams,
  GetAllSnapsResult,
  { origin: string }
>;

/**
 * The `wallet_getAllSnaps` method implementation.
 * Fetches all installed snaps and adds them to the JSON-RPC response.
 *
 * @param request - The JSON-RPC request object.
 * @param response - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param _hooks - The RPC method hooks. Not used by this function.
 * @param messenger - The messenger used to call controller actions.
 * @returns Nothing.
 */
async function getAllSnapsImplementation(
  request: JsonRpcRequest & { origin: string },
  response: PendingJsonRpcResponse<GetAllSnapsResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  _hooks: Record<string, never>,
  messenger: Messenger<string, GetAllSnapsMethodActions>,
): Promise<void> {
  const { origin } = request;

  if (origin !== 'https://snaps.metamask.io') {
    return end(rpcErrors.methodNotFound());
  }

  response.result = messenger.call('SnapController:getAllSnaps');
  return end();
}
