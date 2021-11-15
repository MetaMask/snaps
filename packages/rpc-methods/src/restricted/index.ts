import { confirmHandler, ConfirmHooks } from './confirm';
import {
  getBip44EntropyHandler,
  GetBip44EntropyHooks,
} from './getBip44Entropy';
import { invokeSnapHandler, InvokeSnapHooks } from './invokeSnap';
import { manageStateHandler, ManageStateHooks } from './manageState';

export { ManageStateOperation } from './manageState';

export type RestrictedRpcMethodHooks = ConfirmHooks &
  GetBip44EntropyHooks &
  InvokeSnapHooks &
  ManageStateHooks;

export const handlers = [
  confirmHandler,
  getBip44EntropyHandler,
  invokeSnapHandler,
  manageStateHandler,
];
