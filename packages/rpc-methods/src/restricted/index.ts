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
import {
  manageAccountsBuilder,
  ManageAccountsMethodHooks,
} from './manageAccounts';
import { manageStateBuilder, ManageStateMethodHooks } from './manageState';
import { notifyBuilder, NotifyMethodHooks } from './notify';
import {
  readInterfaceBuilder,
  ReadInterfaceMethodHooks,
} from './readInterface';
import {
  resolveInterfaceBuilder,
  ResolveInterfaceMethodHooks,
} from './resolveInterface';
import {
  showInterfaceBuilder,
  ShowInterfaceMethodHooks,
} from './showInterface';
import {
  updateInterfaceBuilder,
  UpdateInterfaceMethodHooks,
} from './updateInterface';

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
  NotifyMethodHooks &
  ManageAccountsMethodHooks &
  ReadInterfaceMethodHooks &
  ResolveInterfaceMethodHooks &
  ShowInterfaceMethodHooks &
  UpdateInterfaceMethodHooks;

export const restrictedMethodPermissionBuilders = {
  [dialogBuilder.targetName]: dialogBuilder,
  [getBip32EntropyBuilder.targetName]: getBip32EntropyBuilder,
  [getBip32PublicKeyBuilder.targetName]: getBip32PublicKeyBuilder,
  [getBip44EntropyBuilder.targetName]: getBip44EntropyBuilder,
  [getEntropyBuilder.targetName]: getEntropyBuilder,
  [invokeSnapBuilder.targetName]: invokeSnapBuilder,
  [manageStateBuilder.targetName]: manageStateBuilder,
  [notifyBuilder.targetName]: notifyBuilder,
  [manageAccountsBuilder.targetName]: manageAccountsBuilder,
  [readInterfaceBuilder.targetName]: resolveInterfaceBuilder,
  [resolveInterfaceBuilder.targetName]: resolveInterfaceBuilder,
  [showInterfaceBuilder.targetName]: showInterfaceBuilder,
  [updateInterfaceBuilder.targetName]: updateInterfaceBuilder,
} as const;

export * from './caveats';
