import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { providerErrors } from '@metamask/rpc-errors';
import type {
  BackgroundEvent,
  GetBackgroundEventsParams,
  GetBackgroundEventsResult,
  JsonRpcRequest,
} from '@metamask/snaps-sdk';
import { type PendingJsonRpcResponse } from '@metamask/utils';

import { SnapEndowments } from '../endowments';
import type { MethodHooksObject } from '../utils';

const methodName = 'snap_getBackgroundEvents';

const hookNames: MethodHooksObject<GetBackgroundEventsMethodHooks> = {
  getBackgroundEvents: true,
  hasPermission: true,
};

export type GetBackgroundEventsMethodHooks = {
  getBackgroundEvents: () => BackgroundEvent[];
  hasPermission: (permissionName: string) => boolean;
};

/**
 * Get the scheduled background events for the Snap.
 *
 * @example
 * ```ts
 * const events = await snap.request({
 *   method: 'snap_getBackgroundEvents',
 * });
 * console.log(events);
 * // [
 * //   {
 * //     id: 'event-1',
 * //     scheduledAt: 1672531200000,
 * //     snapId: 'npm:example-snap',
 * //     date: 1672531200000,
 * //     request: {
 * //       method: 'example_method',
 * //       params: { example: 'data' },
 * //     },
 * //   },
 * //   ...,
 * // ]
 * ```
 */
export const getBackgroundEventsHandler = {
  methodNames: [methodName] as const,
  implementation: getGetBackgroundEventsImplementation,
  hookNames,
} satisfies PermittedHandlerExport<
  GetBackgroundEventsMethodHooks,
  GetBackgroundEventsParams,
  GetBackgroundEventsResult
>;

/**
 * The `snap_getBackgroundEvents` method implementation.
 *
 * @param _req - The JSON-RPC request object. Not used by this function.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback.
 * Not used by this function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.getBackgroundEvents - The function to get the background events.
 * @param hooks.hasPermission - The function to check if a snap has the `endowment:cronjob` permission.
 * @returns An array of background events.
 */
async function getGetBackgroundEventsImplementation(
  _req: JsonRpcRequest<GetBackgroundEventsParams>,
  res: PendingJsonRpcResponse<GetBackgroundEventsResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { getBackgroundEvents, hasPermission }: GetBackgroundEventsMethodHooks,
): Promise<void> {
  if (!hasPermission(SnapEndowments.Cronjob)) {
    return end(providerErrors.unauthorized());
  }
  try {
    const events = getBackgroundEvents();
    res.result = events;
  } catch (error) {
    return end(error);
  }

  return end();
}
