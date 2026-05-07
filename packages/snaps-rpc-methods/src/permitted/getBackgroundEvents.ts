import type {
  JsonRpcEngineEndCallback,
  MethodHandler,
} from '@metamask/json-rpc-engine';
import type { Messenger } from '@metamask/messenger';
import type { PermissionControllerHasPermissionAction } from '@metamask/permission-controller';
import { providerErrors } from '@metamask/rpc-errors';
import type {
  GetBackgroundEventsParams,
  GetBackgroundEventsResult,
  JsonRpcRequest,
  SnapId,
} from '@metamask/snaps-sdk';
import { type PendingJsonRpcResponse } from '@metamask/utils';

import { SnapEndowments } from '../endowments';
import type { CronjobControllerGetAction } from '../types';

export type GetBackgroundEventsMethodActions =
  | PermissionControllerHasPermissionAction
  | CronjobControllerGetAction;

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
  implementation: getGetBackgroundEventsImplementation,
  actionNames: ['PermissionController:hasPermission', 'CronjobController:get'],
} satisfies MethodHandler<
  never,
  GetBackgroundEventsMethodActions,
  GetBackgroundEventsParams,
  GetBackgroundEventsResult,
  { origin: SnapId }
>;

/**
 * The `snap_getBackgroundEvents` method implementation.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback.
 * Not used by this function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param _hooks - The RPC method hooks. Not used by this function.
 * @param messenger - The messenger used to call controller actions.
 * @returns An array of background events.
 */
async function getGetBackgroundEventsImplementation(
  req: JsonRpcRequest<GetBackgroundEventsParams> & { origin: SnapId },
  res: PendingJsonRpcResponse<GetBackgroundEventsResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  _hooks: never,
  messenger: Messenger<string, GetBackgroundEventsMethodActions>,
): Promise<void> {
  const { origin } = req;

  if (
    !messenger.call(
      'PermissionController:hasPermission',
      origin,
      SnapEndowments.Cronjob,
    )
  ) {
    return end(providerErrors.unauthorized());
  }
  try {
    res.result = messenger.call('CronjobController:get', origin);
  } catch (error) {
    return end(error);
  }

  return end();
}
