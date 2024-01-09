import type { CreateInterfaceMethodHooks } from './createInterface';
import { createInterfaceBuilder } from './createInterface';
import type { DialogMethodHooks } from './dialog';
import { dialogBuilder } from './dialog';
import type { GetBip32EntropyMethodHooks } from './getBip32Entropy';
import { getBip32EntropyBuilder } from './getBip32Entropy';
import type { GetBip32PublicKeyMethodHooks } from './getBip32PublicKey';
import { getBip32PublicKeyBuilder } from './getBip32PublicKey';
import type { GetBip44EntropyMethodHooks } from './getBip44Entropy';
import { getBip44EntropyBuilder } from './getBip44Entropy';
import type { GetEntropyHooks } from './getEntropy';
import { getEntropyBuilder } from './getEntropy';
import type { GetLocaleMethodHooks } from './getLocale';
import { getLocaleBuilder } from './getLocale';
import type { InvokeSnapMethodHooks } from './invokeSnap';
import { invokeSnapBuilder } from './invokeSnap';
import type { ManageAccountsMethodHooks } from './manageAccounts';
import { manageAccountsBuilder } from './manageAccounts';
import type { ManageStateMethodHooks } from './manageState';
import { manageStateBuilder } from './manageState';
import type { NotifyMethodHooks } from './notify';
import { notifyBuilder } from './notify';
import type { ReadInterfaceMethodHooks } from './readInterface';
import { readInterfaceBuilder } from './readInterface';
import type { ResolveInterfaceMethodHooks } from './resolveInterface';
import { resolveInterfaceBuilder } from './resolveInterface';
import type { UpdateInterfaceMethodHooks } from './updateInterface';
import { updateInterfaceBuilder } from './updateInterface';

export { WALLET_SNAP_PERMISSION_KEY } from './invokeSnap';
export { getEncryptionKey } from './manageState';

export type RestrictedMethodHooks = DialogMethodHooks &
  GetBip32EntropyMethodHooks &
  GetBip32PublicKeyMethodHooks &
  GetBip44EntropyMethodHooks &
  GetEntropyHooks &
  InvokeSnapMethodHooks &
  ManageStateMethodHooks &
  NotifyMethodHooks &
  ManageAccountsMethodHooks &
  GetLocaleMethodHooks &
  ReadInterfaceMethodHooks &
  ResolveInterfaceMethodHooks &
  CreateInterfaceMethodHooks &
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
  [getLocaleBuilder.targetName]: getLocaleBuilder,
  [readInterfaceBuilder.targetName]: readInterfaceBuilder,
  [resolveInterfaceBuilder.targetName]: resolveInterfaceBuilder,
  [createInterfaceBuilder.targetName]: createInterfaceBuilder,
  [updateInterfaceBuilder.targetName]: updateInterfaceBuilder,
} as const;

export * from './caveats';
