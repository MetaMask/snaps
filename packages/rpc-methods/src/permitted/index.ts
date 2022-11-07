import { getAppKeyHandler, GetAppKeyHooks } from './getAppKey';
import { getSnapsHandler, GetSnapsHooks } from './getSnaps';
import { requestSnapsHandler, RequestSnapsHooks } from './requestSnaps';
import { invokeSnapSugarHandler } from './invokeSnapSugar';

export type PermittedRpcMethodHooks = GetAppKeyHooks &
  GetSnapsHooks &
  RequestSnapsHooks;

export const handlers = [
  getAppKeyHandler,
  getSnapsHandler,
  requestSnapsHandler,
  invokeSnapSugarHandler,
];
