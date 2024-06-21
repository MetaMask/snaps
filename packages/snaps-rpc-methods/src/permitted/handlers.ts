import { createInterfaceHandler } from './createInterface';
import { getAllSnapsHandler } from './getAllSnaps';
import { getClientStatusHandler } from './getClientStatus';
import { getFileHandler } from './getFile';
import { getInterfaceStateHandler } from './getInterfaceState';
import { getSnapsHandler } from './getSnaps';
import { invokeKeyringHandler } from './invokeKeyring';
import { invokeSnapSugarHandler } from './invokeSnapSugar';
import { requestSnapsHandler } from './requestSnaps';
import { resolveInterfaceHandler } from './resolveInterface';
import { updateInterfaceHandler } from './updateInterface';

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
};
/* eslint-enable @typescript-eslint/naming-convention */

export const handlers = Object.values(methodHandlers);
