import confirmExport, { ConfirmHooks } from './confirm';
import invokePlugin, { InvokePluginHooks } from './invokePlugin';

export type RestrictedRpcMethodHooks = (
  ConfirmHooks &
  InvokePluginHooks
);

export const handlers = [
  confirmExport,
  invokePlugin,
];
