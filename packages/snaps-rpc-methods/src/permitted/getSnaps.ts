import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import type { GetSnapsResult } from '@metamask/snaps-sdk';
import type { JsonRpcParams, PendingJsonRpcResponse } from '@metamask/utils';

import type { MethodHooksObject } from '../utils';

const methodName = 'wallet_getSnaps';

const hookNames: MethodHooksObject<GetSnapsHooks> = {
  getSnaps: true,
};

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
  methodNames: [methodName] as const,
  implementation: getSnapsImplementation,
  hookNames,
} satisfies PermittedHandlerExport<
  GetSnapsHooks,
  JsonRpcParams,
  GetSnapsResult
>;

export type GetSnapsHooks = {
  /**
   * @returns The permitted and installed snaps for the requesting origin.
   */
  getSnaps: () => Promise<GetSnapsResult>;
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
  res: PendingJsonRpcResponse<GetSnapsResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { getSnaps }: GetSnapsHooks,
): Promise<void> {
  // getSnaps is already bound to the origin
  res.result = await getSnaps();
  return end();
}
