import { enableWalletHandler, EnableWalletHooks } from './enable';
import { getAppKeyHandler, GetAppKeyHooks } from './getAppKey';
import { getSnapsHandler, GetSnapsHooks } from './getSnaps';
import { installSnapsHandler, InstallSnapsHooks } from './installSnaps';
import { invokeSnapSugarHandler } from './invokeSnapSugar';

export type PermittedRpcMethodHooks = EnableWalletHooks &
  GetAppKeyHooks &
  GetSnapsHooks &
  InstallSnapsHooks;

export const handlers = [
  enableWalletHandler,
  getAppKeyHandler,
  getSnapsHandler,
  installSnapsHandler,
  invokeSnapSugarHandler,
];
