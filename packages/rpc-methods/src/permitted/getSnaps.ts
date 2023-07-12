import type { InstallSnapsResult } from '@metamask/snaps-utils';
import type {
  PermittedHandlerExport,
  PendingJsonRpcResponse,
  JsonRpcEngineEndCallback,
} from '@metamask/types';

import type { MethodHooksObject } from '../utils';

const hookNames: MethodHooksObject<GetSnapsHooks> = {
  getSnaps: true,
};

/**
 * `wallet_getSnaps` gets the requester's permitted and installed Snaps.
 */
export const getSnapsHandler: PermittedHandlerExport<
  GetSnapsHooks,
  void,
  InstallSnapsResult
> = {
  methodNames: ['wallet_getSnaps'],
  implementation: getSnapsImplementation,
  hookNames,
};

export type GetSnapsHooks = {
  /**
   * @returns The permitted and installed snaps for the requesting origin.
   */
  getSnaps: () => Promise<InstallSnapsResult>;
};

/**
 * The `wallet_getSnaps` method implementation.
 * Fetches available snaps for the requesting origin and adds them to the JSON-RPC response.
 *
 * @param _req - The JSON-RPC request object. Not used by this function.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.getSnaps - A function that returns the snaps available for the requesting origin.
 * @returns Nothing.
 */
async function getSnapsImplementation(
  _req: unknown,
  res: PendingJsonRpcResponse<InstallSnapsResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { getSnaps }: GetSnapsHooks,
): Promise<void> {
  // getSnaps is already bound to the origin
  res.result = await getSnaps();
  return end();
}
