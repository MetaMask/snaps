import { enableWalletHandler, EnableWalletHooks } from './enable';
import { getAppKeyHandler, GetAppKeyHooks } from './getAppKey';
import { getPluginsHandler, GetPluginsHooks } from './getPlugins';
import { installPluginsHandler, InstallPluginsHooks } from './installPlugins';
import { invokePluginSugarHandler } from './invokePluginSugar';

export type PermittedRpcMethodHooks = (
  EnableWalletHooks &
  GetAppKeyHooks &
  GetPluginsHooks &
  InstallPluginsHooks
);

export const handlers = [
  enableWalletHandler,
  getAppKeyHandler,
  getPluginsHandler,
  installPluginsHandler,
  invokePluginSugarHandler,
];
