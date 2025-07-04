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

const permissionName = SnapEndowments.ActivityItemInsight;

type ActivityItemInsightEndowmentSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.Endowment;
  targetName: typeof permissionName;
  endowmentGetter: (_options?: EndowmentGetterParams) => null;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
  validator: PermissionValidatorConstraint;
}>;

/**
 * `endowment:activity-item-insight` returns nothing; it is intended to be used as a flag
 * by the extension to detect whether the snap has the capability to show information on the transaction confirmation screen.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the transaction-insight endowment.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.Endowment,
  any,
  ActivityItemInsightEndowmentSpecification
> = (_builderOptions?: unknown) => {
  return {
    permissionType: PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: [SnapCaveatType.MaxRequestTime],
    endowmentGetter: (_getterOptions?: EndowmentGetterParams) => null,
    validator: createGenericPermissionValidator([
      { type: SnapCaveatType.MaxRequestTime, optional: true },
    ]),
    subjectTypes: [SubjectType.Snap],
  };
};

export const activityItemInsightEndowmentBuilder = Object.freeze({
  targetName: permissionName,
  specificationBuilder,
} as const);
