import {
  createMethodMiddleware,
  type JsonRpcMiddleware,
} from '@metamask/json-rpc-engine';
import type { Messenger } from '@metamask/messenger';
import { rpcErrors } from '@metamask/rpc-errors';
import { logError } from '@metamask/snaps-utils';
import type { Json, JsonRpcParams } from '@metamask/utils';

import type { PermittedRpcMethodActions, PermittedRpcMethodHooks } from '.';
import { cancelBackgroundEventHandler } from './cancelBackgroundEvent';
import { clearStateHandler } from './clearState';
import { closeWebSocketHandler } from './closeWebSocket';
import { createInterfaceHandler } from './createInterface';
import { endTraceHandler } from './endTrace';
import { getAllSnapsHandler } from './getAllSnaps';
import { getBackgroundEventsHandler } from './getBackgroundEvents';
import { getClientStatusHandler } from './getClientStatus';
import { getFileHandler } from './getFile';
import { getInterfaceContextHandler } from './getInterfaceContext';
import { getInterfaceStateHandler } from './getInterfaceState';
import { getSnapsHandler } from './getSnaps';
import { getStateHandler } from './getState';
import { getWebSocketsHandler } from './getWebSockets';
import { invokeKeyringHandler } from './invokeKeyring';
import { invokeSnapSugarHandler } from './invokeSnapSugar';
import { listEntropySourcesHandler } from './listEntropySources';
import { openWebSocketHandler } from './openWebSocket';
import { requestSnapsHandler } from './requestSnaps';
import { resolveInterfaceHandler } from './resolveInterface';
import { scheduleBackgroundEventHandler } from './scheduleBackgroundEvent';
import { sendWebSocketMessageHandler } from './sendWebSocketMessage';
import { setStateHandler } from './setState';
import { startTraceHandler } from './startTrace';
import { trackErrorHandler } from './trackError';
import { trackEventHandler } from './trackEvent';
import { updateInterfaceHandler } from './updateInterface';

/* eslint-disable @typescript-eslint/naming-convention */
const methodHandlers = {
  wallet_getAllSnaps: getAllSnapsHandler,
  wallet_getSnaps: getSnapsHandler,
  wallet_requestSnaps: requestSnapsHandler,
  wallet_invokeSnap: invokeSnapSugarHandler,
  wallet_invokeKeyring: invokeKeyringHandler,
  snap_clearState: clearStateHandler,
  snap_getClientStatus: getClientStatusHandler,
  snap_getFile: getFileHandler,
  snap_getState: getStateHandler,
  snap_createInterface: createInterfaceHandler,
  snap_updateInterface: updateInterfaceHandler,
  snap_getInterfaceState: getInterfaceStateHandler,
  snap_getInterfaceContext: getInterfaceContextHandler,
  snap_listEntropySources: listEntropySourcesHandler,
  snap_resolveInterface: resolveInterfaceHandler,
  snap_scheduleBackgroundEvent: scheduleBackgroundEventHandler,
  snap_cancelBackgroundEvent: cancelBackgroundEventHandler,
  snap_getBackgroundEvents: getBackgroundEventsHandler,
  snap_setState: setStateHandler,
  snap_trackError: trackErrorHandler,
  snap_trackEvent: trackEventHandler,
  snap_openWebSocket: openWebSocketHandler,
  snap_closeWebSocket: closeWebSocketHandler,
  snap_sendWebSocketMessage: sendWebSocketMessageHandler,
  snap_getWebSockets: getWebSocketsHandler,
  snap_startTrace: startTraceHandler,
  snap_endTrace: endTraceHandler,
};
/* eslint-enable @typescript-eslint/naming-convention */

/**
 * Creates a middleware that handles permitted snap RPC methods.
 *
 * @param isSnap - A flag that should indicate whether the requesting origin is a snap or not.
 * @param hooks - An object containing the hooks made available to the permitted RPC methods.
 * @param messenger - The messenger.
 * @returns The middleware.
 */
export function createSnapsMethodMiddleware(
  isSnap: boolean,
  hooks: PermittedRpcMethodHooks,
  messenger: Messenger<string, PermittedRpcMethodActions>,
): JsonRpcMiddleware<JsonRpcParams, Json> {
  const nestedMiddleware = createMethodMiddleware({
    handlers: methodHandlers,
    hooks,
    messenger,
    onError: logError,
  });

  // This is not actually a misused promise, the type is just wrong
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return async function methodMiddleware(request, response, next, end) {
    if (String.prototype.startsWith.call(request.method, 'snap_') && !isSnap) {
      return end(rpcErrors.methodNotFound());
    }

    return nestedMiddleware(request, response, next, end);
  };
}
