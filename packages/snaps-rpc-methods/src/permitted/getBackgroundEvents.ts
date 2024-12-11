import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import type {
  BackgroundEvent,
  GetBackgroundEventsParams,
  GetBackgroundEventsResult,
  JsonRpcRequest,
} from '@metamask/snaps-sdk';
import { type PendingJsonRpcResponse } from '@metamask/utils';

import type { MethodHooksObject } from '../utils';

const methodName = 'snap_getBackgroundEvents';

const hookNames: MethodHooksObject<GetBackgroundEventsMethodHooks> = {
  getBackgroundEvents: true,
};

export type GetBackgroundEventsMethodHooks = {
  getBackgroundEvents: () => BackgroundEvent[];
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
 * @param _req - The JSON-RPC request object. Not used by this
 * function.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback.
 * Not used by this function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.getBackgroundEvents - The function to get the background events.
 * @returns An array of background events.
 */
async function getGetBackgroundEventsImplementation(
  _req: JsonRpcRequest<GetBackgroundEventsParams>,
  res: PendingJsonRpcResponse<GetBackgroundEventsResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { getBackgroundEvents }: GetBackgroundEventsMethodHooks,
): Promise<void> {
  try {
    const events = getBackgroundEvents();
    res.result = events;
  } catch (error) {
    return end(error);
  }

  return end();
}
