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
import type { GetPreferencesMethodHooks } from './getPreferences';
import { getPreferencesBuilder } from './getPreferences';
import type { InvokeSnapMethodHooks } from './invokeSnap';
import { invokeSnapBuilder } from './invokeSnap';
import type { ManageAccountsMethodHooks } from './manageAccounts';
import { manageAccountsBuilder } from './manageAccounts';
import type { ManageStateMethodHooks } from './manageState';
import { manageStateBuilder } from './manageState';
import type { NotifyMethodHooks } from './notify';
import { notifyBuilder } from './notify';

export { WALLET_SNAP_PERMISSION_KEY } from './invokeSnap';
export { getEncryptionEntropy } from './manageState';

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
  GetPreferencesMethodHooks;

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
  [getPreferencesBuilder.targetName]: getPreferencesBuilder,
} as const;

export * from './caveats';
export type { DialogApprovalTypes } from './dialog';
export { DIALOG_APPROVAL_TYPES } from './dialog';
