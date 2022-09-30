import { PermissionConstraint } from '@metamask/controllers';
import { Json } from '@metamask/utils';
import { confirmBuilder, ConfirmMethodHooks } from './confirm';
import { dialogBuilder, DialogMethodHooks } from './dialog';
import {
  getBip44EntropyBuilder,
  getBip44EntropyCaveatMapper,
  getBip44EntropyCaveatSpecifications,
  GetBip44EntropyMethodHooks,
} from './getBip44Entropy';
import { invokeSnapBuilder, InvokeSnapMethodHooks } from './invokeSnap';
import { manageStateBuilder, ManageStateMethodHooks } from './manageState';
import { notifyBuilder, NotifyMethodHooks } from './notify';
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

export {
  AlertFields,
  ConfirmationFields,
  DialogFields,
  DialogParameters,
  DialogType,
  PromptFields,
} from './dialog';
export { ManageStateOperation } from './manageState';
export { NotificationArgs, NotificationType } from './notify';

export type RestrictedMethodHooks = ConfirmMethodHooks &
  DialogMethodHooks &
  GetBip32EntropyMethodHooks &
  GetBip32PublicKeyMethodHooks &
  GetBip44EntropyMethodHooks &
  InvokeSnapMethodHooks &
  ManageStateMethodHooks &
  NotifyMethodHooks;

export const restrictedMethodPermissionBuilders = {
  [confirmBuilder.targetKey]: confirmBuilder,
  [dialogBuilder.targetKey]: dialogBuilder,
  [getBip32EntropyBuilder.targetKey]: getBip32EntropyBuilder,
  [getBip32PublicKeyBuilder.targetKey]: getBip32PublicKeyBuilder,
  [getBip44EntropyBuilder.targetKey]: getBip44EntropyBuilder,
  [invokeSnapBuilder.targetKey]: invokeSnapBuilder,
  [manageStateBuilder.targetKey]: manageStateBuilder,
  [notifyBuilder.targetKey]: notifyBuilder,
} as const;

export const caveatSpecifications = {
  ...getBip32EntropyCaveatSpecifications,
  ...getBip44EntropyCaveatSpecifications,
} as const;

export const caveatMappers: Record<
  string,
  (value: Json) => Pick<PermissionConstraint, 'caveats'>
> = {
  [getBip32EntropyBuilder.targetKey]: getBip32EntropyCaveatMapper,
  [getBip32PublicKeyBuilder.targetKey]: getBip32EntropyCaveatMapper,
  [getBip44EntropyBuilder.targetKey]: getBip44EntropyCaveatMapper,
};
