import { confirmBuilder, ConfirmMethodHooks } from './confirm';
import {
  getBip44EntropyBuilder,
  GetBip44EntropyMethodHooks,
} from './getBip44Entropy';
import { invokeSnapBuilder, InvokeSnapMethodHooks } from './invokeSnap';
import { manageStateBuilder, ManageStateMethodHooks } from './manageState';

export { ManageStateOperation } from './manageState';

export type RestrictedMethodHooks = ConfirmMethodHooks &
  GetBip44EntropyMethodHooks &
  InvokeSnapMethodHooks &
  ManageStateMethodHooks;

export const builders = {
  [confirmBuilder.targetKey]: confirmBuilder,
  [getBip44EntropyBuilder.targetKey]: getBip44EntropyBuilder,
  [invokeSnapBuilder.targetKey]: invokeSnapBuilder,
  [manageStateBuilder.targetKey]: manageStateBuilder,
} as const;
