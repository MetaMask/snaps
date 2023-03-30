import { dialogBuilder, DialogMethodHooks } from './dialog';
import {
  getBip32EntropyBuilder,
  GetBip32EntropyMethodHooks,
} from './getBip32Entropy';
import {
  getBip32PublicKeyBuilder,
  GetBip32PublicKeyMethodHooks,
} from './getBip32PublicKey';
import {
  getBip44EntropyBuilder,
  GetBip44EntropyMethodHooks,
} from './getBip44Entropy';
import { getEntropyBuilder, GetEntropyHooks } from './getEntropy';
import { invokeSnapBuilder, InvokeSnapMethodHooks } from './invokeSnap';
import { manageStateBuilder, ManageStateMethodHooks } from './manageState';
import { notifyBuilder, NotifyMethodHooks } from './notify';

export type { DialogParameters } from './dialog';
export { DialogType } from './dialog';
export { ManageStateOperation } from './manageState';
export { WALLET_SNAP_PERMISSION_KEY } from './invokeSnap';
export type { NotificationArgs, NotificationType } from './notify';

export type RestrictedMethodHooks = DialogMethodHooks &
  GetBip32EntropyMethodHooks &
  GetBip32PublicKeyMethodHooks &
  GetBip44EntropyMethodHooks &
  GetEntropyHooks &
  InvokeSnapMethodHooks &
  ManageStateMethodHooks &
  NotifyMethodHooks;

export const restrictedMethodPermissionBuilders = {
  [dialogBuilder.targetKey]: dialogBuilder,
  [getBip32EntropyBuilder.targetKey]: getBip32EntropyBuilder,
  [getBip32PublicKeyBuilder.targetKey]: getBip32PublicKeyBuilder,
  [getBip44EntropyBuilder.targetKey]: getBip44EntropyBuilder,
  [getEntropyBuilder.targetKey]: getEntropyBuilder,
  [invokeSnapBuilder.targetKey]: invokeSnapBuilder,
  [manageStateBuilder.targetKey]: manageStateBuilder,
  [notifyBuilder.targetKey]: notifyBuilder,
} as const;

export * from '../caveats';
