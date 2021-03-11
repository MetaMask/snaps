import { clearStateHandler, ClearStateHooks } from './clearState';
import { confirmHandler, ConfirmHooks } from './confirm';
import { getBip44EntropyHandler, GetBip44EntropyHooks } from './getBip44Entropy';
import { getStateHandler, GetStateHooks } from './getState';
import { invokePluginHandler, InvokePluginHooks } from './invokePlugin';
import { updateStateHandler, UpdateStateHooks } from './updateState';

export type RestrictedRpcMethodHooks = (
  ClearStateHooks &
  ConfirmHooks &
  GetBip44EntropyHooks &
  GetStateHooks &
  InvokePluginHooks &
  UpdateStateHooks
);

export const handlers = [
  clearStateHandler,
  confirmHandler,
  getBip44EntropyHandler,
  getStateHandler,
  invokePluginHandler,
  updateStateHandler,
];
