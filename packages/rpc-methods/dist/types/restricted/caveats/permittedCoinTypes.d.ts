import type { PermissionConstraint, RestrictedMethodCaveatSpecificationConstraint, Caveat } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';
import type { Json } from '@metamask/utils';
import type { GetBip44EntropyParams } from '../getBip44Entropy';
/**
 * Map a raw value from the `initialPermissions` to a caveat specification.
 * Note that this function does not do any validation, that's handled by the
 * PermissionsController when the permission is requested.
 *
 * @param value - The raw value from the `initialPermissions`.
 * @returns The caveat specification.
 */
export declare function permittedCoinTypesCaveatMapper(value: Json): Pick<PermissionConstraint, 'caveats'>;
/**
 * Validate the params for `snap_getBip44Entropy`.
 *
 * @param value - The params to validate.
 * @throws If the params are invalid.
 */
export declare function validateBIP44Params(value: unknown): asserts value is GetBip44EntropyParams;
/**
 * Validate the coin types values associated with a caveat. This checks if the
 * values are non-negative integers (>= 0).
 *
 * @param caveat - The caveat to validate.
 * @throws If the caveat is invalid.
 */
export declare function validateBIP44Caveat(caveat: Caveat<string, any>): void;
export declare const PermittedCoinTypesCaveatSpecification: Record<SnapCaveatType.PermittedCoinTypes, RestrictedMethodCaveatSpecificationConstraint>;
