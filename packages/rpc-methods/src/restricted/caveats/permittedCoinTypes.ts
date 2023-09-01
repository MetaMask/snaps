import type {
  PermissionConstraint,
  RestrictedMethodCaveatSpecificationConstraint,
  Caveat,
} from '@metamask/permission-controller';
import { FORBIDDEN_COIN_TYPES, SnapCaveatType } from '@metamask/snaps-utils';
import type { Json } from '@metamask/utils';
import { hasProperty, isPlainObject } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';

import type { GetBip44EntropyParams } from '../getBip44Entropy';

/**
 * Map a raw value from the `initialPermissions` to a caveat specification.
 * Note that this function does not do any validation, that's handled by the
 * PermissionsController when the permission is requested.
 *
 * @param value - The raw value from the `initialPermissions`.
 * @returns The caveat specification.
 */
export function permittedCoinTypesCaveatMapper(
  value: Json,
): Pick<PermissionConstraint, 'caveats'> {
  return {
    caveats: [
      {
        type: SnapCaveatType.PermittedCoinTypes,
        value,
      },
    ],
  };
}

/**
 * Validate the params for `snap_getBip44Entropy`.
 *
 * @param value - The params to validate.
 * @throws If the params are invalid.
 */
export function validateBIP44Params(
  value: unknown,
): asserts value is GetBip44EntropyParams {
  if (!isPlainObject(value) || !hasProperty(value, 'coinType')) {
    throw ethErrors.rpc.invalidParams({
      message: 'Expected a plain object containing a coin type.',
    });
  }

  if (
    typeof value.coinType !== 'number' ||
    !Number.isInteger(value.coinType) ||
    value.coinType < 0 ||
    value.coinType > 0x7fffffff
  ) {
    throw ethErrors.rpc.invalidParams({
      message:
        'Invalid "coinType" parameter. Coin type must be a non-negative integer.',
    });
  }

  if (FORBIDDEN_COIN_TYPES.includes(value.coinType)) {
    throw ethErrors.rpc.invalidParams({
      message: `Coin type ${value.coinType} is forbidden.`,
    });
  }
}

/**
 * Validate the coin types values associated with a caveat. This checks if the
 * values are non-negative integers (>= 0).
 *
 * @param caveat - The caveat to validate.
 * @throws If the caveat is invalid.
 */
export function validateBIP44Caveat(caveat: Caveat<string, any>) {
  if (
    !hasProperty(caveat, 'value') ||
    !Array.isArray(caveat.value) ||
    caveat.value.length === 0
  ) {
    throw ethErrors.rpc.invalidParams({
      message: 'Expected non-empty array of coin types.',
    });
  }

  caveat.value.forEach(validateBIP44Params);
}

export const PermittedCoinTypesCaveatSpecification: Record<
  SnapCaveatType.PermittedCoinTypes,
  RestrictedMethodCaveatSpecificationConstraint
> = {
  [SnapCaveatType.PermittedCoinTypes]: Object.freeze({
    type: SnapCaveatType.PermittedCoinTypes,
    decorator: (
      method,
      caveat: Caveat<
        SnapCaveatType.PermittedCoinTypes,
        GetBip44EntropyParams[]
      >,
    ) => {
      return async (args) => {
        const { params } = args;
        validateBIP44Params(params);

        const coinType = caveat.value.find(
          (caveatValue) => caveatValue.coinType === params.coinType,
        );

        if (!coinType) {
          throw ethErrors.provider.unauthorized({
            message:
              'The requested coin type is not permitted. Allowed coin types must be specified in the snap manifest.',
          });
        }

        return await method(args);
      };
    },
    validator: (caveat) => validateBIP44Caveat(caveat),
  }),
};
