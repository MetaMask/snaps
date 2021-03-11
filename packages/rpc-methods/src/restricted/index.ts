import { clearStateHandler, ClearStateHooks } from './clearState';
import { confirmHandler, ConfirmHooks } from './confirm';
import { getBip44EntropyHandler, GetBip44EntropyHooks } from './getBip44Entropy';
import { getStateHandler, GetStateHooks } from './getState';
import { invokePluginHandler, InvokePluginHooks } from './invokePlugin';
import { manageAssetsHandler, ManageAssetsHooks } from './manageAssets';
import { updateStateHandler, UpdateStateHooks } from './updateState';

export type RestrictedRpcMethodHooks = (
  ClearStateHooks &
  ConfirmHooks &
  GetBip44EntropyHooks &
  GetStateHooks &
  InvokePluginHooks &
  ManageAssetsHooks &
  UpdateStateHooks
);

export const handlers = [
  clearStateHandler,
  confirmHandler,
  getBip44EntropyHandler,
  getStateHandler,
  manageAssetsHandler,
  invokePluginHandler,
  updateStateHandler,
];
