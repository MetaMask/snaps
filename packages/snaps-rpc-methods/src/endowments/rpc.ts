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
import type { RpcOrigins } from '@metamask/snaps-utils';
import { assertIsRpcOrigins, SnapCaveatType } from '@metamask/snaps-utils';
import type { Json, NonEmptyArray } from '@metamask/utils';
import { hasProperty, isPlainObject, assert } from '@metamask/utils';

import { createGenericPermissionValidator } from './caveats';
import { SnapEndowments } from './enum';

const targetName = SnapEndowments.Rpc;

type RpcSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.Endowment;
  targetName: typeof targetName;
  endowmentGetter: (_options?: any) => null;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
  validator: PermissionValidatorConstraint;
  subjectTypes: readonly SubjectType[];
}>;

// TODO: Either fix this lint violation or explain why it's necessary to
//  ignore.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type RpcSpecificationBuilderOptions = {
  // Empty for now.
};

/**
 * The specification builder for the JSON-RPC endowment permission.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the JSON-RPC endowment permission.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.Endowment,
  RpcSpecificationBuilderOptions,
  RpcSpecification
> = (_builderOptions?: any): RpcSpecification => {
  return {
    permissionType: PermissionType.Endowment,
    targetName,
    allowedCaveats: [SnapCaveatType.RpcOrigin, SnapCaveatType.MaxRequestTime],
    endowmentGetter: (_getterOptions?: EndowmentGetterParams) => null,
    validator: createGenericPermissionValidator([
      { type: SnapCaveatType.RpcOrigin },
      { type: SnapCaveatType.MaxRequestTime, optional: true },
    ]),
    subjectTypes: [SubjectType.Snap],
  };
};

export const rpcEndowmentBuilder = Object.freeze({
  targetName,
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
      message: 'Invalid JSON-RPC origins: Expected a plain object.',
    });
  }

  const { value } = caveat;
  assertIsRpcOrigins(value, rpcErrors.invalidParams);
}

/**
 * Map a raw value from the `initialPermissions` to a caveat specification.
 * Note that this function does not do any validation, that's handled by the
 * PermissionsController when the permission is requested.
 *
 * @param value - The raw value from the `initialPermissions`.
 * @returns The caveat specification.
 */
export function getRpcCaveatMapper(
  value: Json,
): Pick<PermissionConstraint, 'caveats'> {
  return {
    caveats: [
      {
        type: SnapCaveatType.RpcOrigin,
        value,
      },
    ],
  };
}

/**
 * Getter function to get the {@link RpcOrigins} caveat value from a permission.
 *
 * @param permission - The permission to get the caveat value from.
 * @returns The caveat value.
 * @throws If the permission does not have a valid {@link RpcOrigins} caveat.
 */
export function getRpcCaveatOrigins(
  permission?: PermissionConstraint,
): RpcOrigins | null {
  const caveats = permission?.caveats?.filter(
    (caveat) => caveat.type === SnapCaveatType.RpcOrigin,
  );
  assert(caveats);
  assert(caveats.length === 1);

  const caveat = caveats[0] as Caveat<string, RpcOrigins>;
  return caveat.value;
}

export const rpcCaveatSpecifications: Record<
  SnapCaveatType.RpcOrigin,
  CaveatSpecificationConstraint
> = {
  [SnapCaveatType.RpcOrigin]: Object.freeze({
    type: SnapCaveatType.RpcOrigin,
    validator: (caveat: Caveat<string, any>) => validateCaveatOrigins(caveat),
  }),
};
