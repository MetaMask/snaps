import { getSnapsHandler, GetSnapsHooks } from './getSnaps';
import { invokeSnapSugarHandler } from './invokeSnapSugar';
import { requestSnapsHandler, RequestSnapsHooks } from './requestSnaps';

export type PermittedRpcMethodHooks = GetSnapsHooks & RequestSnapsHooks;

/* eslint-disable @typescript-eslint/naming-convention */
export const methodHandlers = {
  wallet_getSnaps: getSnapsHandler,
  wallet_requestSnaps: requestSnapsHandler,
  wallet_invokeSnap: invokeSnapSugarHandler,
};
/* eslint-enable @typescript-eslint/naming-convention */

export const handlers = Object.values(methodHandlers);
