import {
  Caveat,
  PermissionConstraint,
  RestrictedMethodOptions,
  RestrictedMethodParameters,
  RestrictedMethodCaveatSpecificationConstraint,
} from '@metamask/permission-controller';
import {
  assertIsValidSnapId,
  SnapCaveatType,
  Bip32Entropy,
  Bip32EntropyStruct,
} from '@metamask/snaps-utils';
import {
  Json,
  assertStruct,
  hasProperty,
  isObject,
  isPlainObject,
} from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';
import { array, size, type } from 'superstruct';

import { GetBip44EntropyParams } from './restricted/getBip44Entropy';
import { InvokeSnapParams } from './restricted/invokeSnap';
import { isEqual } from './utils';

// CAVEAT MAPPERS - Used to map params to caveats internally

/**
 * Map a raw value from the `initialPermissions` to a caveat specification.
 * Note that this function does not do any validation, that's handled by the
 * PermissionsController when the permission is requested.
 *
 * @param value - The raw value from the `initialPermissions`.
 * @returns The caveat specification.
 */
export function getBip32EntropyCaveatMapper(
  value: Json,
): Pick<PermissionConstraint, 'caveats'> {
  return {
    caveats: [
      {
        type: SnapCaveatType.PermittedDerivationPaths,
        value,
      },
    ],
  };
}

/**
 * Map a raw value from the `initialPermissions` to a caveat specification.
 * Note that this function does not do any validation, that's handled by the
 * PermissionsController when the permission is requested.
 *
 * @param value - The raw value from the `initialPermissions`.
 * @returns The caveat specification.
 */
export function getBip44EntropyCaveatMapper(
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

// VALIDATION FUNCTIONS - Validation functions for the various caveat types

/**
 * Validate a caveat path object. The object must consist of a `path` array and
 * a `curve` string. Paths must start with `m`, and must contain at
 * least two indices. If `ed25519` is used, this checks if all the path indices
 * are hardened.
 *
 * @param value - The value to validate.
 * @throws If the value is invalid.
 */
export function validateBIP32Path(
  value: unknown,
): asserts value is Bip32Entropy {
  assertStruct(
    value,
    Bip32EntropyStruct,
    'Invalid BIP-32 entropy path definition',
    ethErrors.rpc.invalidParams,
  );
}

/**
 * Validate the path values associated with a caveat. This validates that the
 * value is a non-empty array with valid derivation paths and curves.
 *
 * @param caveat - The caveat to validate.
 * @throws If the value is invalid.
 */
export function validateBIP32CaveatPaths(
  caveat: Caveat<string, any>,
): asserts caveat is Caveat<string, Bip32Entropy[]> {
  assertStruct(
    caveat,
    type({ value: size(array(Bip32EntropyStruct), 1, Infinity) }),
    'Invalid BIP-32 entropy caveat',
    ethErrors.rpc.internal,
  );
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

/**
 * Validates that the caveat value exists and is a non-empty object.
 *
 * @param caveat - The caveat to validate.
 * @throws If the caveat is invalid.
 */
export function validateSnapIdCaveat(caveat: Caveat<string, any>) {
  if (!isObject(caveat.value) || Object.keys(caveat.value).length === 0) {
    throw ethErrors.rpc.invalidParams({
      message:
        'Expected caveat to have a value property of a non-empty object of snap IDs.',
    });
  }
  const snapIds = Object.keys(caveat.value);
  for (const snapId of snapIds) {
    assertIsValidSnapId(snapId);
  }
}

// CAVEAT SPECIFICATIONS - Specifications outlined for each SnapCaveatType

// Caveat specification used for getBip32Entropy and getBip32PublicKey permissions/methods
export const PermittedDerivationPathCaveatSpecification: Record<
  SnapCaveatType.PermittedDerivationPaths,
  RestrictedMethodCaveatSpecificationConstraint
> = {
  [SnapCaveatType.PermittedDerivationPaths]: Object.freeze({
    type: SnapCaveatType.PermittedDerivationPaths,
    decorator: (
      method,
      caveat: Caveat<SnapCaveatType.PermittedDerivationPaths, Bip32Entropy[]>,
    ) => {
      return async (args) => {
        const { params } = args;
        validateBIP32Path(params);

        const path = caveat.value.find(
          (caveatPath) =>
            isEqual(
              params.path.slice(0, caveatPath.path.length),
              caveatPath.path,
            ) && caveatPath.curve === params.curve,
        );

        if (!path) {
          throw ethErrors.provider.unauthorized({
            message:
              'The requested path is not permitted. Allowed paths must be specified in the snap manifest.',
          });
        }

        return await method(args);
      };
    },
    validator: (caveat) => validateBIP32CaveatPaths(caveat),
  }),
};

// Caveat specification used for the getBip44Entropy permission/method
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

// Caveat specification used for the wallet_invokeSnap RPC method
export const SnapIdsCaveatSpecification: Record<
  SnapCaveatType.SnapIds,
  RestrictedMethodCaveatSpecificationConstraint
> = {
  [SnapCaveatType.SnapIds]: Object.freeze({
    type: SnapCaveatType.SnapIds,
    validator: (caveat) => validateSnapIdCaveat(caveat),
    decorator: (method, caveat) => {
      return async (args) => {
        const {
          params,
          context: { origin },
        }: RestrictedMethodOptions<RestrictedMethodParameters> = args;
        const snapIds = caveat.value;
        const { snapId } = params as InvokeSnapParams;
        if (!hasProperty(snapIds, snapId)) {
          throw new Error(
            `${origin} does not have permission to invoke ${snapId} snap.`,
          );
        }
        return await method(args);
      };
    },
  }),
};
