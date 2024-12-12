import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
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

export const getBackgroundEventsHandler: PermittedHandlerExport<
  GetBackgroundEventsMethodHooks,
  GetBackgroundEventsParams,
  GetBackgroundEventsResult
> = {
  methodNames: [methodName],
  implementation: getGetBackgroundEventsImplementation,
  hookNames,
};

/**
 * The `snap_getBackgroundEvents` method implementation.
 *
 * @param req - The JSON-RPC request object.
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
  req: JsonRpcRequest<GetBackgroundEventsParams>,
  res: PendingJsonRpcResponse<GetBackgroundEventsResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { getBackgroundEvents, hasPermission }: GetBackgroundEventsMethodHooks,
): Promise<void> {
  const { origin } = req as JsonRpcRequest & { origin: string };

  if (!hasPermission(SnapEndowments.Cronjob)) {
    return end(
      rpcErrors.invalidRequest({
        message: `The snap "${origin}" does not have the "${SnapEndowments.Cronjob}" permission.`,
      }),
    );
  }
  try {
    const events = getBackgroundEvents();
    res.result = events;
  } catch (error) {
    return end(error);
  }

  return end();
}
