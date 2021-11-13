import { clearStateHandler, ClearStateHooks } from './clearState';
import { confirmHandler, ConfirmHooks } from './confirm';
import {
  getBip44EntropyHandler,
  GetBip44EntropyHooks,
} from './getBip44Entropy';
import { getStateHandler, GetStateHooks } from './getState';
import { invokeSnapHandler, InvokeSnapHooks } from './invokeSnap';
import { updateStateHandler, UpdateStateHooks } from './updateState';

export type RestrictedRpcMethodHooks = ClearStateHooks &
  ConfirmHooks &
  GetBip44EntropyHooks &
  GetStateHooks &
  InvokeSnapHooks &
  UpdateStateHooks;

export const handlers = [
  clearStateHandler,
  confirmHandler,
  getBip44EntropyHandler,
  getStateHandler,
  invokeSnapHandler,
  updateStateHandler,
];
