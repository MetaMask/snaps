import type { Caveat, PermissionConstraint, RestrictedMethodCaveatSpecificationConstraint } from '@metamask/permission-controller';
import type { Bip32Entropy } from '@metamask/snaps-utils';
import { SnapCaveatType } from '@metamask/snaps-utils';
import type { Json } from '@metamask/utils';
/**
 * Map a raw value from the `initialPermissions` to a caveat specification.
 * Note that this function does not do any validation, that's handled by the
 * PermissionsController when the permission is requested.
 *
 * @param value - The raw value from the `initialPermissions`.
 * @returns The caveat specification.
 */
export declare function permittedDerivationPathsCaveatMapper(value: Json): Pick<PermissionConstraint, 'caveats'>;
/**
 * Validate a caveat path object. The object must consist of a `path` array and
 * a `curve` string. Paths must start with `m`, and must contain at
 * least two indices. If `ed25519` is used, this checks if all the path indices
 * are hardened.
 *
 * @param value - The value to validate.
 * @throws If the value is invalid.
 */
export declare function validateBIP32Path(value: unknown): asserts value is Bip32Entropy;
/**
 * Validate the path values associated with a caveat. This validates that the
 * value is a non-empty array with valid derivation paths and curves.
 *
 * @param caveat - The caveat to validate.
 * @throws If the value is invalid.
 */
export declare function validateBIP32CaveatPaths(caveat: Caveat<string, any>): asserts caveat is Caveat<string, Bip32Entropy[]>;
export declare const PermittedDerivationPathsCaveatSpecification: Record<SnapCaveatType.PermittedDerivationPaths, RestrictedMethodCaveatSpecificationConstraint>;
