import { createInterfaceHandler } from './createInterface';
import { providerRequestHandler } from './experimentalProviderRequest';
import { getAllSnapsHandler } from './getAllSnaps';
import { getClientStatusHandler } from './getClientStatus';
import { getCurrencyRateHandler } from './getCurrencyRate';
import { getFileHandler } from './getFile';
import { getInterfaceStateHandler } from './getInterfaceState';
import { getSnapsHandler } from './getSnaps';
import { invokeKeyringHandler } from './invokeKeyring';
import { invokeSnapSugarHandler } from './invokeSnapSugar';
import { readDeviceHandler } from './readDevice';
import { requestDeviceHandler } from './requestDevice';
import { requestSnapsHandler } from './requestSnaps';
import { resolveInterfaceHandler } from './resolveInterface';
import { updateInterfaceHandler } from './updateInterface';
import { writeDeviceHandler } from './writeDevice';

/* eslint-disable @typescript-eslint/naming-convention */
export const methodHandlers = {
  wallet_getAllSnaps: getAllSnapsHandler,
  wallet_getSnaps: getSnapsHandler,
  wallet_requestSnaps: requestSnapsHandler,
  wallet_invokeSnap: invokeSnapSugarHandler,
  wallet_invokeKeyring: invokeKeyringHandler,
  snap_getClientStatus: getClientStatusHandler,
  snap_getFile: getFileHandler,
  snap_createInterface: createInterfaceHandler,
  snap_updateInterface: updateInterfaceHandler,
  snap_getInterfaceState: getInterfaceStateHandler,
  snap_resolveInterface: resolveInterfaceHandler,
  snap_getCurrencyRate: getCurrencyRateHandler,
  snap_experimentalProviderRequest: providerRequestHandler,
  snap_readDevice: readDeviceHandler,
  snap_requestDevice: requestDeviceHandler,
  snap_writeDevice: writeDeviceHandler,
};
/* eslint-enable @typescript-eslint/naming-convention */

export const handlers = Object.values(methodHandlers);
