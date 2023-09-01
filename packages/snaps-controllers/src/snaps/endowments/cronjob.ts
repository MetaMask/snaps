import type {
  PermissionSpecificationBuilder,
  EndowmentGetterParams,
  ValidPermissionSpecification,
  PermissionConstraint,
  Caveat,
  CaveatSpecificationConstraint,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import type { CronjobSpecification } from '@metamask/snaps-utils';
import {
  SnapCaveatType,
  isCronjobSpecificationArray,
} from '@metamask/snaps-utils';
import type { Json, NonEmptyArray } from '@metamask/utils';
import { assert, hasProperty, isPlainObject } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';

import { SnapEndowments } from './enum';

const permissionName = SnapEndowments.Cronjob;

type CronjobEndowmentSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.Endowment;
  targetName: typeof permissionName;
  endowmentGetter: (_options?: any) => undefined;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;

/**
 * `endowment:cronjob` returns nothing; it is intended to be used as a flag to determine whether the snap wants to run cronjobs.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the cronjob endowment.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.Endowment,
  any,
  CronjobEndowmentSpecification
> = (_builderOptions?: any) => {
  return {
    permissionType: PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: [SnapCaveatType.SnapCronjob],
    endowmentGetter: (_getterOptions?: EndowmentGetterParams) => undefined,
    subjectTypes: [SubjectType.Snap],
  };
};

export const cronjobEndowmentBuilder = Object.freeze({
  targetName: permissionName,
  specificationBuilder,
} as const);

/**
 * Map a raw value from the `initialPermissions` to a caveat specification.
 * Note that this function does not do any validation, that's handled by the
 * PermissionsController when the permission is requested.
 *
 * @param value - The raw value from the `initialPermissions`.
 * @returns The caveat specification.
 */
export function getCronjobCaveatMapper(
  value: Json,
): Pick<PermissionConstraint, 'caveats'> {
  return {
    caveats: [
      {
        type: SnapCaveatType.SnapCronjob,
        value,
      },
    ],
  };
}

/**
 * Getter function to get the cronjobs from a permission.
 *
 * This does basic validation of the caveat, but does not validate the type or
 * value of the namespaces object itself, as this is handled by the
 * `PermissionsController` when the permission is requested.
 *
 * @param permission - The permission to get the keyring namespaces from.
 * @returns The cronjobs, or `null` if the permission does not have a
 * cronjob caveat.
 */
export function getCronjobCaveatJobs(
  permission?: PermissionConstraint,
): CronjobSpecification[] | null {
  if (!permission?.caveats) {
    return null;
  }

  assert(permission.caveats.length === 1);
  assert(permission.caveats[0].type === SnapCaveatType.SnapCronjob);

  const caveat = permission.caveats[0] as Caveat<string, { jobs: Json[] }>;

  return (caveat.value?.jobs as CronjobSpecification[]) ?? null;
}

/**
 * Validate the cronjob specification values associated with a caveat.
 * This validates that the value is a non-empty array with valid
 * cronjob expression and request object.
 *
 * @param caveat - The caveat to validate.
 * @throws If the value is invalid.
 */
export function validateCronjobCaveat(caveat: Caveat<string, any>) {
  if (!hasProperty(caveat, 'value') || !isPlainObject(caveat.value)) {
    throw ethErrors.rpc.invalidParams({
      message: 'Expected a plain object.',
    });
  }

  const { value } = caveat;

  if (!hasProperty(value, 'jobs') || !isPlainObject(value)) {
    throw ethErrors.rpc.invalidParams({
      message: 'Expected a plain object.',
    });
  }

  if (!isCronjobSpecificationArray(value.jobs)) {
    throw ethErrors.rpc.invalidParams({
      message: 'Expected a valid cronjob specification array.',
    });
  }
}

/**
 * Caveat specification for the Cronjob.
 */
export const cronjobCaveatSpecifications: Record<
  SnapCaveatType.SnapCronjob,
  CaveatSpecificationConstraint
> = {
  [SnapCaveatType.SnapCronjob]: Object.freeze({
    type: SnapCaveatType.SnapCronjob,
    validator: (caveat) => validateCronjobCaveat(caveat),
  }),
};
