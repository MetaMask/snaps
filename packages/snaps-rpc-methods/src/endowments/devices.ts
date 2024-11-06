import type {
  Caveat,
  CaveatSpecificationConstraint,
  EndowmentGetterParams,
  PermissionConstraint,
  PermissionSpecificationBuilder,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type { DeviceSpecification } from '@metamask/snaps-utils';
import {
  SnapCaveatType,
  isDeviceSpecificationArray,
} from '@metamask/snaps-utils';
import { hasProperty, isPlainObject, assert } from '@metamask/utils';

import { SnapEndowments } from './enum';

const permissionName = SnapEndowments.Devices;

type DevicesEndowmentSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.Endowment;
  targetName: typeof permissionName;
  endowmentGetter: (_options?: any) => null;
  allowedCaveats: [SnapCaveatType.DeviceIds];
}>;

/**
 * The `endowment:devices` permission is granted to a Snap when it requested
 * access to a specific device. The device IDs are specified in the caveat.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the network endowment.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.Endowment,
  any,
  DevicesEndowmentSpecification
> = (_builderOptions?: any) => {
  return {
    permissionType: PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: [SnapCaveatType.DeviceIds],
    endowmentGetter: (_getterOptions?: EndowmentGetterParams) => null,
    subjectTypes: [SubjectType.Snap],
  };
};

export const devicesEndowmentBuilder = Object.freeze({
  targetName: permissionName,
  specificationBuilder,
} as const);

/**
 * Getter function to get the permitted device IDs from a permission
 * specification.
 *
 * This does basic validation of the caveat, but does not validate the type or
 * value of the namespaces object itself, as this is handled by the
 * `PermissionsController` when the permission is requested.
 *
 * @param permission - The permission to get the device IDs from.
 * @returns The device IDs, or `null` if the permission does not have a
 * device IDs caveat.
 */
export function getPermittedDeviceIds(
  permission?: PermissionConstraint,
): DeviceSpecification[] | null {
  if (!permission?.caveats) {
    return null;
  }

  assert(permission.caveats.length === 1);
  assert(permission.caveats[0].type === SnapCaveatType.DeviceIds);

  const caveat = permission.caveats[0] as Caveat<
    string,
    { devices: DeviceSpecification[] }
  >;

  return caveat.value?.devices ?? null;
}

/**
 * Validate the device IDs specification values associated with a caveat.
 * This validates that the value is a non-empty array with valid device
 * specification objects.
 *
 * @param caveat - The caveat to validate.
 * @throws If the value is invalid.
 */
export function validateDeviceIdsCaveat(caveat: Caveat<string, any>) {
  if (!hasProperty(caveat, 'value') || !isPlainObject(caveat.value)) {
    throw rpcErrors.invalidParams({
      message: 'Expected a plain object.',
    });
  }

  const { value } = caveat;

  if (!hasProperty(value, 'devices') || !isPlainObject(value)) {
    throw rpcErrors.invalidParams({
      message: 'Expected a plain object.',
    });
  }

  if (!isDeviceSpecificationArray(value.jobs)) {
    throw rpcErrors.invalidParams({
      message: 'Expected a valid device specification array.',
    });
  }
}

/**
 * Caveat specification for the device IDs caveat.
 */
export const deviceIdsCaveatSpecifications: Record<
  SnapCaveatType.DeviceIds,
  CaveatSpecificationConstraint
> = {
  [SnapCaveatType.DeviceIds]: Object.freeze({
    type: SnapCaveatType.DeviceIds,
    validator: (caveat) => validateDeviceIdsCaveat(caveat),
  }),
};
