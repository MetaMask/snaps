import type {
  Caveat,
  CaveatSpecificationConstraint,
  EndowmentGetterParams,
  PermissionConstraint,
  PermissionSpecificationBuilder,
  PermissionValidatorConstraint,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type { KeyringOrigins } from '@metamask/snaps-utils';
import { assertIsKeyringOrigins, SnapCaveatType } from '@metamask/snaps-utils';
import type { Json, NonEmptyArray } from '@metamask/utils';
import { assert, hasProperty, isPlainObject } from '@metamask/utils';

import { createGenericPermissionValidator } from './caveats';
import { SnapEndowments } from './enum';

const permissionName = SnapEndowments.Keyring;

type KeyringEndowmentSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.Endowment;
  targetName: typeof permissionName;
  endowmentGetter: (_options?: EndowmentGetterParams) => null;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
  validator: PermissionValidatorConstraint;
  subjectTypes: readonly SubjectType[];
}>;

/**
 * `endowment:keyring` returns nothing; it is intended to be used as a flag
 * by the client to detect whether the snap has keyring capabilities.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the keyring endowment.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.Endowment,
  any,
  KeyringEndowmentSpecification
> = (_builderOptions?: unknown) => {
  return {
    permissionType: PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: [
      SnapCaveatType.KeyringOrigin,
      SnapCaveatType.MaxRequestTime,
    ],
    endowmentGetter: (_getterOptions?: EndowmentGetterParams) => null,
    validator: createGenericPermissionValidator([
      { type: SnapCaveatType.KeyringOrigin },
      { type: SnapCaveatType.MaxRequestTime, optional: true },
    ]),
    subjectTypes: [SubjectType.Snap],
  };
};

export const keyringEndowmentBuilder = Object.freeze({
  targetName: permissionName,
  specificationBuilder,
} as const);

/**
 * Validate the value of a caveat. This does not validate the type of the
 * caveat itself, only the value of the caveat.
 *
 * @param caveat - The caveat to validate.
 * @throws If the caveat value is invalid.
 */
function validateCaveatOrigins(caveat: Caveat<string, any>) {
  if (!hasProperty(caveat, 'value') || !isPlainObject(caveat.value)) {
    throw rpcErrors.invalidParams({
      message: 'Invalid keyring origins: Expected a plain object.',
    });
  }

  const { value } = caveat;
  assertIsKeyringOrigins(value, rpcErrors.invalidParams);
}

/**
 * Map a raw value from the `initialPermissions` to a caveat specification.
 * Note that this function does not do any validation, that's handled by the
 * PermissionsController when the permission is requested.
 *
 * @param value - The raw value from the `initialPermissions`.
 * @returns The caveat specification.
 */
export function getKeyringCaveatMapper(
  value: Json,
): Pick<PermissionConstraint, 'caveats'> {
  return {
    caveats: [
      {
        type: SnapCaveatType.KeyringOrigin,
        value,
      },
    ],
  };
}

/**
 * Getter function to get the {@link KeyringOrigins} caveat value from a
 * permission.
 *
 * @param permission - The permission to get the caveat value from.
 * @returns The caveat value.
 * @throws If the permission does not have a valid {@link KeyringOrigins}
 * caveat.
 */
export function getKeyringCaveatOrigins(
  permission?: PermissionConstraint,
): KeyringOrigins | null {
  assert(permission?.caveats);
  assert(permission.caveats.length === 1);
  assert(permission.caveats[0].type === SnapCaveatType.KeyringOrigin);

  const caveat = permission.caveats[0] as Caveat<string, KeyringOrigins>;
  return caveat.value;
}

export const keyringCaveatSpecifications: Record<
  SnapCaveatType.KeyringOrigin,
  CaveatSpecificationConstraint
> = {
  [SnapCaveatType.KeyringOrigin]: Object.freeze({
    type: SnapCaveatType.KeyringOrigin,
    validator: (caveat: Caveat<string, any>) => validateCaveatOrigins(caveat),
  }),
};
