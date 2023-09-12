import type {
  EndowmentGetterParams,
  PermissionSpecificationBuilder,
  PermissionValidatorConstraint,
  ValidPermissionSpecification,
  Caveat,
  CaveatSpecificationConstraint,
  PermissionConstraint,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapCaveatType, isChainId } from '@metamask/snaps-utils';
import type { Json, NonEmptyArray } from '@metamask/utils';
import { assert, hasProperty, isPlainObject } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';

import { SnapEndowments } from './enum';

const permissionName = SnapEndowments.NameLookup;

type NameLookupEndowmentSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.Endowment;
  targetName: typeof permissionName;
  endowmentGetter: (_options?: EndowmentGetterParams) => undefined;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
  validator: PermissionValidatorConstraint;
}>;

/**
 * `endowment:name-lookup` returns nothing; it is intended to be used as a flag
 * by the extension to detect whether the snap has the capability to resolve a domain/address.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the name-lookup endowment.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.Endowment,
  any,
  NameLookupEndowmentSpecification
> = (_builderOptions?: unknown) => {
  return {
    permissionType: PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: [SnapCaveatType.ChainIds],
    endowmentGetter: (_getterOptions?: EndowmentGetterParams) => undefined,
    validator: ({ caveats }) => {
      if (
        !caveats ||
        (caveats !== null && caveats?.length > 1) ||
        (caveats?.length === 1 && caveats[0].type !== SnapCaveatType.ChainIds)
      ) {
        throw ethErrors.rpc.invalidParams({
          message: `Expected a single "${SnapCaveatType.ChainIds}" caveat.`,
        });
      }
    },
    subjectTypes: [SubjectType.Snap],
  };
};

export const nameLookupEndowmentBuilder = Object.freeze({
  targetName: permissionName,
  specificationBuilder,
} as const);

/**
 * Validates the type of the caveat value.
 *
 * @param caveat - The caveat to validate.
 * @throws If the caveat value is invalid.
 */
function validateCaveat(caveat: Caveat<string, any>): void {
  if (!hasProperty(caveat, 'value') || !isPlainObject(caveat)) {
    throw ethErrors.rpc.invalidParams({
      message: 'Expected a plain object.',
    });
  }

  const { value } = caveat;

  assert(
    Array.isArray(value) && value.every((val) => isChainId(val)),
    'Expected caveat value to have type "string array"',
  );
}

/**
 * Map a raw value from the `initialPermissions` to a caveat specification.
 * Note that this function does not do any validation, that's handled by the
 * PermissionsController when the permission is requested.
 *
 * @param value - The raw value from the `initialPermissions`.
 * @returns The caveat specification.
 */
export function getNameLookupCaveatMapper(
  value: Json,
): Pick<PermissionConstraint, 'caveats'> {
  if (
    !value ||
    !Array.isArray(value) ||
    (Array.isArray(value) && value.length === 0)
  ) {
    return { caveats: null };
  }
  return {
    caveats: [
      {
        type: SnapCaveatType.ChainIds,
        value,
      },
    ],
  };
}

/**
 * Getter function to get the chainIds caveat from a permission.
 *
 * This does basic validation of the caveat, but does not validate the type or
 * value of the namespaces object itself, as this is handled by the
 * `PermissionsController` when the permission is requested.
 *
 * @param permission - The permission to get the `chainIds` caveat from.
 * @returns An array of `chainIds` that the snap supports.
 */
export function getChainIdsCaveat(
  permission?: PermissionConstraint,
): string[] | null {
  if (!permission?.caveats) {
    return null;
  }

  assert(permission.caveats.length === 1);
  assert(permission.caveats[0].type === SnapCaveatType.ChainIds);

  const caveat = permission.caveats[0] as Caveat<string, string[]>;

  return caveat.value ?? null;
}

export const nameLookupCaveatSpecifications: Record<
  SnapCaveatType.ChainIds,
  CaveatSpecificationConstraint
> = {
  [SnapCaveatType.ChainIds]: Object.freeze({
    type: SnapCaveatType.ChainIds,
    validator: (caveat: Caveat<string, any>) => validateCaveat(caveat),
  }),
};
