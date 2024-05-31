import type {
  Caveat,
  CaveatConstraint,
  EndowmentGetterParams,
  PermissionConstraint,
  PermissionSpecificationBuilder,
  PermissionValidatorConstraint,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import type { KeyringOrigins } from '@metamask/snaps-utils';
import { SnapCaveatType } from '@metamask/snaps-utils';
import type { Json, NonEmptyArray } from '@metamask/utils';
import { isObject } from '@metamask/utils';

import { createGenericPermissionValidator } from './caveats';
import { SnapEndowments } from './enum';

const permissionName = SnapEndowments.Accounts;

type AccountsEndowmentSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.Endowment;
  targetName: typeof permissionName;
  endowmentGetter: (_options?: EndowmentGetterParams) => undefined;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
  validator: PermissionValidatorConstraint;
  subjectTypes: readonly SubjectType[];
}>;

/**
 * `endowment:accounts` returns nothing; it is intended to be used as a flag
 * by the client to detect whether the Snap supports the Accounts API.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the accounts endowment.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.Endowment,
  any,
  AccountsEndowmentSpecification
> = (_builderOptions?: unknown) => {
  return {
    permissionType: PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: [
      SnapCaveatType.KeyringOrigin,
      SnapCaveatType.ChainIds,
      SnapCaveatType.MaxRequestTime,
    ],
    endowmentGetter: (_getterOptions?: EndowmentGetterParams) => undefined,
    validator: createGenericPermissionValidator([
      { type: SnapCaveatType.KeyringOrigin },
      { type: SnapCaveatType.ChainIds },
      { type: SnapCaveatType.MaxRequestTime, optional: true },
    ]),
    subjectTypes: [SubjectType.Snap],
  };
};

export const accountsEndowmentBuilder = Object.freeze({
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
export function getAccountsCaveatMapper(
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

  if (value.allowedOrigins) {
    caveats.push({
      type: SnapCaveatType.KeyringOrigin,
      value: { allowedOrigins: value.allowedOrigins },
    });
  }

  return { caveats: caveats as NonEmptyArray<CaveatConstraint> };
}

/**
 * Getter function to get the {@link KeyringOrigins} caveat value from a
 * permission.
 *
 * @param permission - The permission to get the caveat value from.
 * @returns The caveat value.
 */
export function getAccountsCaveatOrigins(
  permission?: PermissionConstraint,
): KeyringOrigins | null {
  const caveat = permission?.caveats?.find(
    (permCaveat) => permCaveat.type === SnapCaveatType.KeyringOrigin,
  ) as Caveat<string, KeyringOrigins> | undefined;

  return caveat ? caveat.value : null;
}

/**
 * Getter function to get the {@link ChainIds} caveat value from a
 * permission.
 *
 * @param permission - The permission to get the caveat value from.
 * @returns The caveat value.
 */
export function getAccountsCaveatChainIds(
  permission?: PermissionConstraint,
): string[] | null {
  const caveat = permission?.caveats?.find(
    (permCaveat) => permCaveat.type === SnapCaveatType.ChainIds,
  ) as Caveat<string, string[]> | undefined;

  return caveat ? caveat.value : null;
}
