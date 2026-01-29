import type {
  PermissionSpecificationBuilder,
  EndowmentGetterParams,
  ValidPermissionSpecification,
  PermissionValidatorConstraint,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';
import type { NonEmptyArray } from '@metamask/utils';

import { createGenericPermissionValidator } from './caveats';
import { SnapEndowments } from './enum';

const permissionName = SnapEndowments.LifecycleHooks;

type LifecycleHooksEndowmentSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.Endowment;
  targetName: typeof permissionName;
  endowmentGetter: (_options?: EndowmentGetterParams) => null;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
  validator: PermissionValidatorConstraint;
}>;

/**
 * `endowment:lifecycle-hooks` returns nothing; it is intended to be used as a
 * flag by the snap controller to detect whether the snap has the capability to
 * use lifecycle hooks.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the `lifecycle-hooks` endowment.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.Endowment,
  any,
  LifecycleHooksEndowmentSpecification
> = (_builderOptions?: unknown) => {
  return {
    permissionType: PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: [SnapCaveatType.MaxRequestTime],
    endowmentGetter: (_getterOptions?: EndowmentGetterParams) => null,
    subjectTypes: [SubjectType.Snap],
    validator: createGenericPermissionValidator([
      { type: SnapCaveatType.MaxRequestTime, optional: true },
    ]),
  };
};

export const lifecycleHooksEndowmentBuilder = Object.freeze({
  targetName: permissionName,
  specificationBuilder,
} as const);
