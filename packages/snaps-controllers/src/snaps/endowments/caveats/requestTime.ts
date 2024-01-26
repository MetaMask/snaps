import type {
  Caveat,
  CaveatSpecificationConstraint,
  PermissionConstraint,
} from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import { MaxRequestTimeStruct, SnapCaveatType } from '@metamask/snaps-utils';
import type { AssertionErrorConstructor, Json } from '@metamask/utils';
import { assertStruct, hasProperty, isObject } from '@metamask/utils';

import type { CaveatMapperFunction, CaveatMapperReturnValue } from './generic';

/**
 * Asserts that the given value is a valid `maxRequestTime` value.
 *
 * @param value - The value to assert.
 * @param ErrorWrapper - An optional error wrapper to use. Defaults to
 * {@link AssertionError}.
 * @throws If the value is not a valid `maxRequestTime` value.
 */
function assertIsMaxRequestTime(
  value: unknown, // eslint-disable-next-line @typescript-eslint/naming-convention
  ErrorWrapper?: AssertionErrorConstructor,
): asserts value is number {
  assertStruct(
    value,
    MaxRequestTimeStruct,
    'Invalid maxRequestTime',
    ErrorWrapper,
  );
}

/**
 * Validate the value of a caveat. This does not validate the type of the
 * caveat itself, only the value of the caveat.
 *
 * @param caveat - The caveat to validate.
 * @throws If the caveat value is invalid.
 */
function validateMaxRequestTimeCaveat(caveat: Caveat<string, any>) {
  if (!hasProperty(caveat, 'value')) {
    throw rpcErrors.invalidParams({
      message: 'Invalid maxRequestTime caveat.',
    });
  }

  const { value } = caveat;
  assertIsMaxRequestTime(value, rpcErrors.invalidParams);
}

/**
 * Map a raw value from the `initialPermissions` to a caveat specification.
 * Note that this function does not do any validation, that's handled by the
 * PermissionsController when the permission is requested.
 *
 * @param value - The raw value from the `initialPermissions`.
 * @returns The caveat specification.
 */
export function getMaxRequestTimeCaveatMapper(
  value: Json,
): CaveatMapperReturnValue {
  if (
    !value ||
    !isObject(value) ||
    (isObject(value) && !hasProperty(value, 'maxRequestTime'))
  ) {
    return { caveats: null };
  }
  return {
    caveats: [
      {
        type: SnapCaveatType.MaxRequestTime,
        value: value.maxRequestTime,
      },
    ],
  };
}

/**
 * Creates a wrapping caveat mapper that creates the `maxRequestTime` caveat
 * and merges it with any other caveats created by the mapper function.
 *
 * @param mapper - Another caveat mapper function.
 * @returns The caveat specification.
 */
export function createMaxRequestTimeMapper(
  mapper: CaveatMapperFunction,
): CaveatMapperFunction {
  return function (value: Json) {
    // We assume this to be used only with caveats of this type
    const { maxRequestTime, ...rest } = value as Record<string, Json>;

    const mapperResult = mapper(rest);

    if (!maxRequestTime) {
      return mapperResult;
    }

    return {
      ...mapperResult,
      caveats: [
        ...(mapperResult.caveats ?? []),
        {
          type: SnapCaveatType.MaxRequestTime,
          value: maxRequestTime,
        },
      ],
    };
  };
}

/**
 * Getter function to get the {@link MaxRequestTime} caveat value from a permission if specified.
 *
 * @param permission - The permission to get the caveat value from.
 * @returns The caveat value if present, otherwise null.
 */
export function getMaxRequestTimeCaveat(
  permission?: PermissionConstraint,
): number | null {
  const foundCaveat = permission?.caveats?.find(
    (caveat) => caveat.type === SnapCaveatType.MaxRequestTime,
  );
  return (foundCaveat?.value as number) ?? null;
}

export const maxRequestTimeCaveatSpecifications: Record<
  SnapCaveatType.MaxRequestTime,
  CaveatSpecificationConstraint
> = {
  [SnapCaveatType.MaxRequestTime]: Object.freeze({
    type: SnapCaveatType.MaxRequestTime,
    validator: (caveat: Caveat<string, any>) =>
      validateMaxRequestTimeCaveat(caveat),
  }),
};
