import { getAppKeyHandler, GetAppKeyHooks } from './getAppKey';
import { getSnapsHandler, GetSnapsHooks } from './getSnaps';
import { invokeSnapSugarHandler } from './invokeSnapSugar';
import { requestSnapsHandler, RequestSnapsHooks } from './requestSnaps';

export type PermittedRpcMethodHooks = GetAppKeyHooks &
  GetSnapsHooks &
  RequestSnapsHooks;

export const handlers = [
  getAppKeyHandler,
  getSnapsHandler,
  requestSnapsHandler,
  invokeSnapSugarHandler,
];
