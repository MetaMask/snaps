import type {
  Caveat,
  PermissionConstraint,
  RestrictedMethodCaveatSpecificationConstraint,
} from '@metamask/permission-controller';
import type { Bip32Entropy } from '@metamask/snaps-utils';
import {
  SnapCaveatType,
  Bip32EntropyStruct,
  isEqual,
} from '@metamask/snaps-utils';
import type { Json } from '@metamask/utils';
import { assertStruct } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';
import { array, size, type } from 'superstruct';

/**
 * Map a raw value from the `initialPermissions` to a caveat specification.
 * Note that this function does not do any validation, that's handled by the
 * PermissionsController when the permission is requested.
 *
 * @param value - The raw value from the `initialPermissions`.
 * @returns The caveat specification.
 */
export function permittedDerivationPathsCaveatMapper(
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

export const PermittedDerivationPathsCaveatSpecification: Record<
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
