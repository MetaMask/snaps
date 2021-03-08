import { clearStateHandler, ClearStateHooks } from './clearState';
import { enableWalletHandler, EnableWalletHooks } from './enable';
import { getAppKeyHandler, GetAppKeyHooks } from './getAppKey';
import { getPluginsHandler, GetPluginsHooks } from './getPlugins';
import { getStateHandler, GetStateHooks } from './getState';
import { installPluginsHandler, InstallPluginsHooks } from './installPlugins';
import { invokePluginSugarHandler } from './invokePluginSugar';
import { updateStateHandler, UpdateStateHooks } from './updateState';

export type PermittedRpcMethodHooks = (
  ClearStateHooks &
  EnableWalletHooks &
  GetAppKeyHooks &
  GetPluginsHooks &
  GetStateHooks &
  InstallPluginsHooks &
  UpdateStateHooks
);

export const handlers = [
  clearStateHandler,
  enableWalletHandler,
  getAppKeyHandler,
  getPluginsHandler,
  getStateHandler,
  installPluginsHandler,
  invokePluginSugarHandler,
  updateStateHandler,
];
