import { confirmBuilder, ConfirmMethodHooks } from './confirm';
import {
  getBip44EntropyBuilder,
  GetBip44EntropyMethodHooks,
} from './getBip44Entropy';
import { invokeSnapBuilder, InvokeSnapMethodHooks } from './invokeSnap';
import { manageStateBuilder, ManageStateMethodHooks } from './manageState';
import { notifyBuilder, NotifyMethodHooks } from './notify';

export { ManageStateOperation } from './manageState';

export type RestrictedMethodHooks = ConfirmMethodHooks &
  GetBip44EntropyMethodHooks &
  InvokeSnapMethodHooks &
  ManageStateMethodHooks &
  NotifyMethodHooks;

export const builders = {
  [confirmBuilder.targetKey]: confirmBuilder,
  [getBip44EntropyBuilder.targetKey]: getBip44EntropyBuilder,
  [invokeSnapBuilder.targetKey]: invokeSnapBuilder,
  [manageStateBuilder.targetKey]: manageStateBuilder,
  [notifyBuilder.targetKey]: notifyBuilder,
} as const;
