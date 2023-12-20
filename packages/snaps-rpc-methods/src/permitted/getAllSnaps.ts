import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type { GetSnapsResult } from '@metamask/snaps-sdk';
import type {
  JsonRpcParams,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from '@metamask/utils';

import type { MethodHooksObject } from '../utils';

const hookNames: MethodHooksObject<GetAllSnapsHooks> = {
  getAllSnaps: true,
};

/**
 * `wallet_getAllSnaps` gets all installed Snaps. Currently, this can only be
 * called from `https://snaps.metamask.io`.
 */
export const getAllSnapsHandler: PermittedHandlerExport<
  GetAllSnapsHooks,
  JsonRpcParams,
  GetSnapsResult
> = {
  methodNames: ['wallet_getAllSnaps'],
  implementation: getAllSnapsImplementation,
  hookNames,
};

export type GetAllSnapsHooks = {
  /**
   * @returns All installed Snaps.
   */
  getAllSnaps: () => Promise<GetSnapsResult>;
};

/**
 * The `wallet_getAllSnaps` method implementation.
 * Fetches all installed snaps and adds them to the JSON-RPC response.
 *
 * @param request - The JSON-RPC request object.
 * @param response - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.getAllSnaps - A function that returns all installed snaps.
 * @returns Nothing.
 */
async function getAllSnapsImplementation(
  request: JsonRpcRequest,
  response: PendingJsonRpcResponse<GetSnapsResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { getAllSnaps }: GetAllSnapsHooks,
): Promise<void> {
  // The origin is added by the MetaMask middleware stack.
  const { origin } = request as JsonRpcRequest & { origin: string };

  if (origin !== 'https://snaps.metamask.io') {
    return end(rpcErrors.methodNotFound());
  }

  response.result = await getAllSnaps();
  return end();
}
