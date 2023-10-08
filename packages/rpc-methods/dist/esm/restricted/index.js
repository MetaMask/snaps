import { dialogBuilder } from './dialog';
import { getBip32EntropyBuilder } from './getBip32Entropy';
import { getBip32PublicKeyBuilder } from './getBip32PublicKey';
import { getBip44EntropyBuilder } from './getBip44Entropy';
import { getEntropyBuilder } from './getEntropy';
import { getLocaleBuilder } from './getLocale';
import { invokeSnapBuilder } from './invokeSnap';
import { manageAccountsBuilder } from './manageAccounts';
import { manageStateBuilder } from './manageState';
import { notifyBuilder } from './notify';
export { DialogType } from './dialog';
export { ManageStateOperation } from './manageState';
export { WALLET_SNAP_PERMISSION_KEY } from './invokeSnap';
export { NotificationType } from './notify';
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
    [getLocaleBuilder.targetName]: getLocaleBuilder
};
export * from './caveats';

//# sourceMappingURL=index.js.map