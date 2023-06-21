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
export type { NotificationArgs } from './notify';
export { NotificationType } from './notify';

export type RestrictedMethodHooks = DialogMethodHooks &
  GetBip32EntropyMethodHooks &
  GetBip32PublicKeyMethodHooks &
  GetBip44EntropyMethodHooks &
  GetEntropyHooks &
  InvokeSnapMethodHooks &
  ManageStateMethodHooks &
  NotifyMethodHooks;

export const restrictedMethodPermissionBuilders = {
  [dialogBuilder.targetName]: dialogBuilder,
  [getBip32EntropyBuilder.targetName]: getBip32EntropyBuilder,
  [getBip32PublicKeyBuilder.targetName]: getBip32PublicKeyBuilder,
  [getBip44EntropyBuilder.targetName]: getBip44EntropyBuilder,
  [getEntropyBuilder.targetName]: getEntropyBuilder,
  [invokeSnapBuilder.targetName]: invokeSnapBuilder,
  [manageStateBuilder.targetName]: manageStateBuilder,
  [notifyBuilder.targetName]: notifyBuilder,
} as const;

export * from './caveats';
