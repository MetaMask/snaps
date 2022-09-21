import { isNamespacesObject, SnapCaveatType } from '@metamask/snap-utils';
import {
  Caveat,
  CaveatSpecificationConstraint,
  EndowmentGetterParams,
  PermissionSpecificationBuilder,
  PermissionType,
  PermissionValidatorConstraint,
  ValidPermissionSpecification,
} from '@metamask/controllers';
import { hasProperty, isPlainObject, NonEmptyArray } from '@metamask/utils';
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

  if (!isNamespacesObject(caveat.value)) {
    throw ethErrors.rpc.invalidParams({
      message: 'Expected a valid namespaces object.',
    });
  }
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
