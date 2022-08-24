import { PermissionConstraint } from '@metamask/controllers';
import { Json } from '@metamask/utils';
import { confirmBuilder, ConfirmMethodHooks } from './confirm';
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
} from './getBip32Entropy';
import { getBip44EntropyLegacyBuilder } from './getBip44EntropyLegacy';

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
  [getBip44EntropyLegacyBuilder.targetKey]: getBip44EntropyLegacyBuilder,
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
  [getBip44EntropyBuilder.targetKey]: getBip44EntropyCaveatMapper,
};
