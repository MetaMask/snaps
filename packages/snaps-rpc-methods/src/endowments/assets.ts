import type {
  PermissionSpecificationBuilder,
  EndowmentGetterParams,
  ValidPermissionSpecification,
  PermissionConstraint,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';
import type { Json, NonEmptyArray } from '@metamask/utils';
import { assert, isObject } from '@metamask/utils';

import { createGenericPermissionValidator } from './caveats';
import { SnapEndowments } from './enum';

const permissionName = SnapEndowments.Assets;

type AssetsEndowmentSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.Endowment;
  targetName: typeof permissionName;
  endowmentGetter: (_options?: any) => null;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;

/**
 * `endowment:assets` returns nothing; it is intended to be used as a flag to determine whether the Snap can run asset queries.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the assets endowment.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.Endowment,
  any,
  AssetsEndowmentSpecification
> = (_builderOptions?: any) => {
  return {
    permissionType: PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: [SnapCaveatType.ChainIds, SnapCaveatType.MaxRequestTime],
    endowmentGetter: (_getterOptions?: EndowmentGetterParams) => null,
    subjectTypes: [SubjectType.Snap],
    validator: createGenericPermissionValidator([
      { type: SnapCaveatType.ChainIds },
      { type: SnapCaveatType.MaxRequestTime, optional: true },
    ]),
  };
};

export const assetsEndowmentBuilder = Object.freeze({
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
export function getAssetsCaveatMapper(
  value: Json,
): Pick<PermissionConstraint, 'caveats'> {
  assert(isObject(value) && value.scopes);

  return {
    caveats: [
      {
        type: SnapCaveatType.ChainIds,
        value: value.scopes,
      },
    ],
  };
}
