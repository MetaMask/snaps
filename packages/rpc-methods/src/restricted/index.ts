import { confirmHandler, ConfirmHooks } from './confirm';
import { invokePluginHandler, InvokePluginHooks } from './invokePlugin';
import { getBip44EntropyHandler, GetBip44EntropyHooks } from './getBip44Entropy';

export type RestrictedRpcMethodHooks = (
  ConfirmHooks &
  GetBip44EntropyHooks &
  InvokePluginHooks
);

export const handlers = [
  confirmHandler,
  getBip44EntropyHandler,
  invokePluginHandler,
];
