import clearState, { ClearStateHooks } from './clearState';
import enable, { EnableWalletHooks } from './enable';
import getAppKey, { GetAppKeyHooks } from './getAppKey';
import getPlugins, { GetPluginsHooks } from './getPlugins';
import getState, { GetStateHooks } from './getState';
import installPlugins, { InstallPluginsHooks } from './installPlugins';
import invokePlugin from './invokePluginSugar';
import updateState, { UpdateStateHooks } from './updateState';

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
  clearState,
  enable,
  getAppKey,
  getPlugins,
  getState,
  installPlugins,
  invokePlugin,
  updateState,
];
