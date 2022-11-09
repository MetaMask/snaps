import {
  assertIsNamespacesObject,
  Namespaces,
  SnapCaveatType,
} from '@metamask/snap-utils';
import {
  Caveat,
  CaveatSpecificationConstraint,
  EndowmentGetterParams,
  PermissionConstraint,
  PermissionSpecificationBuilder,
  PermissionType,
  PermissionValidatorConstraint,
  ValidPermissionSpecification,
} from '@metamask/controllers';
import {
  hasProperty,
  isPlainObject,
  Json,
  NonEmptyArray,
  assert,
} from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';
import { SnapEndowments } from './enum';

const targetKey = SnapEndowments.Keyring;

type KeyringSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.Endowment;
  targetKey: typeof targetKey;
  endowmentGetter: (_options?: any) => undefined;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
  validator: PermissionValidatorConstraint;
}>;

type KeyringSpecificationBuilderOptions = {
  // Empty for now.
};

/**
 * The specification builder for the keyring endowment permission.
 *
 * @returns The specification for the keyring endowment permission.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.Endowment,
  KeyringSpecificationBuilderOptions,
  KeyringSpecification
> = (): KeyringSpecification => {
  return {
    permissionType: PermissionType.Endowment,
    targetKey,
    allowedCaveats: [SnapCaveatType.SnapKeyring],
    endowmentGetter: (_getterOptions?: EndowmentGetterParams) => undefined,
    validator: ({ caveats }) => {
      if (
        caveats?.length !== 1 ||
        caveats[0].type !== SnapCaveatType.SnapKeyring
      ) {
        throw ethErrors.rpc.invalidParams({
          message: `Expected a single "${SnapCaveatType.SnapKeyring}" caveat.`,
        });
      }
    },
  };
};

export const keyringEndowmentBuilder = Object.freeze({
  targetKey,
  specificationBuilder,
} as const);

/**
 * Validate the namespaces value of a caveat. This does not validate the type or
 * value of the caveat itself, only the value of the namespaces object.
 *
 * @param caveat - The caveat to validate.
 * @throws If the caveat value is invalid.
 */
function validateCaveatNamespace(caveat: Caveat<string, any>): void {
  if (!hasProperty(caveat, 'value') || !isPlainObject(caveat.value)) {
    throw ethErrors.rpc.invalidParams({
      message: 'Expected a plain object.',
    });
  }

  const { value } = caveat;

  if (!hasProperty(value, 'namespaces') || !isPlainObject(value)) {
    throw ethErrors.rpc.invalidParams({
      message: 'Expected a plain object.',
    });
  }

  assertIsNamespacesObject(value.namespaces, ethErrors.rpc.invalidParams);
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
        type: SnapCaveatType.SnapKeyring,
        value,
      },
    ],
  };
}

/**
 * Getter function to get the keyring namespaces from a permission.
 *
 * This does basic validation of the caveat, but does not validate the type or
 * value of the namespaces object itself, as this is handled by the
 * `PermissionsController` when the permission is requested.
 *
 * @param permission - The permission to get the keyring namespaces from.
 * @returns The keyring namespaces, or `null` if the permission does not have a
 * keyring caveat.
 */
export function getKeyringCaveatNamespaces(
  permission?: PermissionConstraint,
): Namespaces | null {
  if (!permission?.caveats) {
    return null;
  }

  assert(permission.caveats.length === 1);
  assert(permission.caveats[0].type === SnapCaveatType.SnapKeyring);

  const caveat = permission.caveats[0] as Caveat<
    string,
    { namespaces: Namespaces }
  >;

  return caveat.value?.namespaces ?? null;
}

export const keyringCaveatSpecifications: Record<
  SnapCaveatType.SnapKeyring,
  CaveatSpecificationConstraint
> = {
  [SnapCaveatType.SnapKeyring]: Object.freeze({
    type: SnapCaveatType.SnapKeyring,
    validator: (caveat: Caveat<string, any>) => validateCaveatNamespace(caveat),
  }),
};
