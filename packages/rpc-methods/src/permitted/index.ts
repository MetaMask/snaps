import { getAppKeyHandler, GetAppKeyHooks } from './getAppKey';
import { getSnapsHandler, GetSnapsHooks } from './getSnaps';
import { installSnapsHandler, InstallSnapsHooks } from './installSnaps';
import { invokeSnapSugarHandler } from './invokeSnapSugar';

export type PermittedRpcMethodHooks = GetAppKeyHooks &
  GetSnapsHooks &
  InstallSnapsHooks;

export const handlers = [
  getAppKeyHandler,
  getSnapsHandler,
  installSnapsHandler,
  invokeSnapSugarHandler,
];
