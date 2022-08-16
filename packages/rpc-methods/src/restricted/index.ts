import { SnapCaveatType } from '../caveats';
import { confirmBuilder, ConfirmMethodHooks } from './confirm';
import {
  getBip44EntropyBuilder,
  GetBip44EntropyMethodHooks,
} from './getBip44Entropy';
import { invokeSnapBuilder, InvokeSnapMethodHooks } from './invokeSnap';
import { manageStateBuilder, ManageStateMethodHooks } from './manageState';
import { notifyBuilder, NotifyMethodHooks } from './notify';
import {
  getBip32EntropyBuilder,
  getBip32EntropyCaveatSpecificationBuilder,
} from './getBip32Entropy';

export { ManageStateOperation } from './manageState';
export { NotificationArgs, NotificationType } from './notify';

export type RestrictedMethodHooks = ConfirmMethodHooks &
  GetBip44EntropyMethodHooks &
  InvokeSnapMethodHooks &
  ManageStateMethodHooks &
  NotifyMethodHooks;

export const builders = {
  [confirmBuilder.targetKey]: confirmBuilder,
  [getBip32EntropyBuilder.targetKey]: getBip32EntropyBuilder,
  [getBip44EntropyBuilder.targetKey]: getBip44EntropyBuilder,
  [invokeSnapBuilder.targetKey]: invokeSnapBuilder,
  [manageStateBuilder.targetKey]: manageStateBuilder,
  [notifyBuilder.targetKey]: notifyBuilder,
} as const;

export const caveatSpecifications = {
  [SnapCaveatType.PermittedDerivationPaths]:
    getBip32EntropyCaveatSpecificationBuilder,
} as const;
