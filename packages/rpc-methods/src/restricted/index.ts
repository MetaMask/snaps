import { PermissionConstraint } from '@metamask/permission-controller';
import { Json } from '@metamask/utils';

import { dialogBuilder, DialogMethodHooks } from './dialog';
import {
  getBip32EntropyBuilder,
  getBip32EntropyCaveatMapper,
  getBip32EntropyCaveatSpecifications,
  GetBip32EntropyMethodHooks,
} from './getBip32Entropy';
import {
  getBip32PublicKeyBuilder,
  GetBip32PublicKeyMethodHooks,
} from './getBip32PublicKey';
import {
  getBip44EntropyBuilder,
  getBip44EntropyCaveatMapper,
  getBip44EntropyCaveatSpecifications,
  GetBip44EntropyMethodHooks,
} from './getBip44Entropy';
import { getEntropyBuilder, GetEntropyHooks } from './getEntropy';
import {
  InvokeSnapCaveatSpecifications,
  invokeSnapBuilder,
  InvokeSnapMethodHooks,
} from './invokeSnap';
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

export const caveatSpecifications = {
  ...getBip32EntropyCaveatSpecifications,
  ...getBip44EntropyCaveatSpecifications,
  ...InvokeSnapCaveatSpecifications,
} as const;

export const caveatMappers: Record<
  string,
  (value: Json) => Pick<PermissionConstraint, 'caveats'>
> = {
  [getBip32EntropyBuilder.targetKey]: getBip32EntropyCaveatMapper,
  [getBip32PublicKeyBuilder.targetKey]: getBip32EntropyCaveatMapper,
  [getBip44EntropyBuilder.targetKey]: getBip44EntropyCaveatMapper,
};
