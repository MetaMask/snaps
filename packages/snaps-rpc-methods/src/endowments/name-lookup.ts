import type {
  EndowmentGetterParams,
  PermissionSpecificationBuilder,
  PermissionValidatorConstraint,
  ValidPermissionSpecification,
  Caveat,
  CaveatSpecificationConstraint,
  PermissionConstraint,
  CaveatConstraint,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import {
  ChainIdsStruct,
  LookupMatchersStruct,
  SnapCaveatType,
} from '@metamask/snaps-utils';
import type { Json, NonEmptyArray } from '@metamask/utils';
import {
  assert,
  assertStruct,
  hasProperty,
  isObject,
  isPlainObject,
} from '@metamask/utils';

import { createGenericPermissionValidator } from './caveats';
import { SnapEndowments } from './enum';

const permissionName = SnapEndowments.NameLookup;

type NameLookupEndowmentSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.Endowment;
  targetName: typeof permissionName;
  endowmentGetter: (_options?: EndowmentGetterParams) => null;
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
    allowedCaveats: [
      SnapCaveatType.ChainIds,
      SnapCaveatType.LookupMatchers,
      SnapCaveatType.MaxRequestTime,
    ],
    endowmentGetter: (_getterOptions?: EndowmentGetterParams) => null,
    validator: createGenericPermissionValidator([
      { type: SnapCaveatType.ChainIds, optional: true },
      { type: SnapCaveatType.LookupMatchers, optional: true },
      { type: SnapCaveatType.MaxRequestTime, optional: true },
    ]),
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
    throw rpcErrors.invalidParams({
      message: 'Expected a plain object.',
    });
  }

  const { value } = caveat;

  switch (caveat.type) {
    case SnapCaveatType.ChainIds:
      assertStruct(value, ChainIdsStruct);
      break;
    case SnapCaveatType.LookupMatchers:
      assertStruct(value, LookupMatchersStruct);
      break;
    default:
      throw rpcErrors.invalidParams({
        message:
          'Invalid caveat type, must be one of the following: "chainIds", "matchers".',
      });
  }
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
  if (!value || !isObject(value) || Object.keys(value).length === 0) {
    return { caveats: null };
  }

  const caveats = [];

  if (value.chains) {
    caveats.push({
      type: SnapCaveatType.ChainIds,
      value: value.chains,
    });
  }

  if (value.matchers) {
    caveats.push({
      type: SnapCaveatType.LookupMatchers,
      value: value.matchers,
    });
  }

  assert(caveats.length > 0);

  return { caveats: caveats as NonEmptyArray<CaveatConstraint> };
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

  const caveat = permission.caveats.find(
    (permCaveat) => permCaveat.type === SnapCaveatType.ChainIds,
  ) as Caveat<string, string[]> | undefined;

  return caveat ? caveat.value : null;
}

/**
 * Getter function to get the matchers caveat from a permission.
 *
 * This does basic validation of the caveat, but does not validate the type or
 * value of the namespaces object itself, as this is handled by the
 * `PermissionsController` when the permission is requested.
 *
 * @param permission - The permission to get the `matchers` caveat from.
 * @returns A `matchers` object that defines the input that the snap supports.
 */
export function getLookupMatchersCaveat(
  permission?: PermissionConstraint,
): Record<string, string[]> | null {
  if (!permission?.caveats) {
    return null;
  }

  const caveat = permission.caveats.find(
    (permCaveat) => permCaveat.type === SnapCaveatType.LookupMatchers,
  ) as Caveat<string, Record<string, string[]>> | undefined;

  return caveat ? caveat.value : null;
}

export const nameLookupCaveatSpecifications: Record<
  SnapCaveatType.ChainIds | SnapCaveatType.LookupMatchers,
  CaveatSpecificationConstraint
> = {
  [SnapCaveatType.ChainIds]: Object.freeze({
    type: SnapCaveatType.ChainIds,
    validator: (caveat: Caveat<string, any>) => validateCaveat(caveat),
  }),
  [SnapCaveatType.LookupMatchers]: Object.freeze({
    type: SnapCaveatType.LookupMatchers,
    validator: (caveat: Caveat<string, any>) => validateCaveat(caveat),
  }),
};
