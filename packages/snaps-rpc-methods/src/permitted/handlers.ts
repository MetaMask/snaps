import { cancelBackgroundEventHandler } from './cancelBackgroundEvent';
import { clearStateHandler } from './clearState';
import { createInterfaceHandler } from './createInterface';
import { providerRequestHandler } from './experimentalProviderRequest';
import { getAllSnapsHandler } from './getAllSnaps';
import { getBackgroundEventsHandler } from './getBackgroundEvents';
import { getClientStatusHandler } from './getClientStatus';
import { getCurrencyRateHandler } from './getCurrencyRate';
import { getFileHandler } from './getFile';
import { getInterfaceContextHandler } from './getInterfaceContext';
import { getInterfaceStateHandler } from './getInterfaceState';
import { getSnapsHandler } from './getSnaps';
import { getStateHandler } from './getState';
import { invokeKeyringHandler } from './invokeKeyring';
import { invokeSnapSugarHandler } from './invokeSnapSugar';
import { listEntropySourcesHandler } from './listEntropySources';
import { requestSnapsHandler } from './requestSnaps';
import { resolveInterfaceHandler } from './resolveInterface';
import { scheduleBackgroundEventHandler } from './scheduleBackgroundEvent';
import { setStateHandler } from './setState';
import { updateInterfaceHandler } from './updateInterface';

/* eslint-disable @typescript-eslint/naming-convention */
export const methodHandlers = {
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
  snap_getCurrencyRate: getCurrencyRateHandler,
  snap_experimentalProviderRequest: providerRequestHandler,
  snap_scheduleBackgroundEvent: scheduleBackgroundEventHandler,
  snap_cancelBackgroundEvent: cancelBackgroundEventHandler,
  snap_getBackgroundEvents: getBackgroundEventsHandler,
  snap_setState: setStateHandler,
};
/* eslint-enable @typescript-eslint/naming-convention */

export const handlers = Object.values(methodHandlers);
