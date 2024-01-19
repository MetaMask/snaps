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
import { SnapCaveatType, isChainId } from '@metamask/snaps-utils';
import type { Json, NonEmptyArray } from '@metamask/utils';
import { assert, hasProperty, isObject, isPlainObject } from '@metamask/utils';

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
 * Helper function to determine if the passed in caveats
 * match the specification for `endowment:name-lookup`.
 *
 * @param caveats - Value that needs to be validated.
 * @returns boolean.
 */

const hasValidCaveats = (caveats: unknown) => {
  if (!caveats) {
    return false;
  }

  if (!Array.isArray(caveats)) {
    return false;
  }

  if (caveats.length < 1 || caveats.length > 2) {
    return false;
  }

  if (caveats.length === 1) {
    return (
      caveats[0].type === SnapCaveatType.ChainIds ||
      caveats[0].type === SnapCaveatType.Matchers
    );
  }

  if (caveats.length === 2) {
    const caveatSet = new Set();
    caveats.forEach((caveat) => caveatSet.add(caveat.type));
    if (
      caveatSet.has(SnapCaveatType.ChainIds) &&
      caveatSet.has(SnapCaveatType.Matchers)
    ) {
      return true;
    }
  }

  return false;
};

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
    allowedCaveats: [SnapCaveatType.ChainIds, SnapCaveatType.Matchers],
    endowmentGetter: (_getterOptions?: EndowmentGetterParams) => undefined,
    validator: ({ caveats }) => {
      if (!hasValidCaveats(caveats)) {
        throw rpcErrors.invalidParams({
          message: `Expected one or both of the "${SnapCaveatType.ChainIds}" and "${SnapCaveatType.Matchers}" caveats.`,
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
    throw rpcErrors.invalidParams({
      message: 'Expected a plain object.',
    });
  }

  const { value } = caveat;

  switch (caveat.type) {
    case SnapCaveatType.ChainIds:
      assert(
        Array.isArray(value) && value.every((val) => isChainId(val)),
        'Expected caveat value to have type "string array"',
      );
      break;
    case SnapCaveatType.Matchers:
      assert(
        isObject(value) &&
          Object.keys(value).length > 0 &&
          Object.keys(value).length <= 2,
        'Expect caveat value to be a non-empty object with at most 2 properties.',
      );

      assert(
        (hasProperty(value, 'tlds') && hasProperty(value, 'schemes')) ||
          hasProperty(value, 'tlds') ||
          hasProperty(value, 'schemes'),
        'Expected caveat value to only have either or both of the following properties: "tlds", "schemes".',
      );

      assert(
        ['tlds', 'schemes'].every((prop) => {
          if (Array.isArray(value[prop])) {
            return (value[prop] as unknown[]).every(
              (val) => typeof val === 'string',
            );
          }
          return false;
        }),
        '"tlds" and "schemes" properties must be string arrays.',
      );
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
      type: SnapCaveatType.Matchers,
      value: value.matchers,
    });
  }

  if (caveats.length === 0) {
    return { caveats: null };
  }

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
  );
  assert(permission.caveats.length === 1 || permission.caveats.length === 2);
  assert(caveat);
  assert(caveat.type === SnapCaveatType.ChainIds);

  return (caveat as Caveat<string, string[]>).value ?? null;
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
export function getMatchersCaveat(
  permission?: PermissionConstraint,
): Record<string, string[]> | null {
  if (!permission?.caveats) {
    return null;
  }

  const caveat = permission.caveats.find(
    (permCaveat) => permCaveat.type === SnapCaveatType.Matchers,
  );
  assert(permission.caveats.length === 1 || permission.caveats.length === 2);
  assert(caveat);
  assert(caveat.type === SnapCaveatType.Matchers);

  return (caveat as Caveat<string, Record<string, string[]>>).value ?? null;
}

export const nameLookupCaveatSpecifications: Record<
  SnapCaveatType.ChainIds | SnapCaveatType.Matchers,
  CaveatSpecificationConstraint
> = {
  [SnapCaveatType.ChainIds]: Object.freeze({
    type: SnapCaveatType.ChainIds,
    validator: (caveat: Caveat<string, any>) => validateCaveat(caveat),
  }),
  [SnapCaveatType.Matchers]: Object.freeze({
    type: SnapCaveatType.Matchers,
    validator: (caveat: Caveat<string, any>) => validateCaveat(caveat),
  }),
};
