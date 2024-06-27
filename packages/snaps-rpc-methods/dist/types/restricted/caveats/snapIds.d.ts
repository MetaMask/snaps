import type { Caveat, RestrictedMethodCaveatSpecificationConstraint, PermissionConstraint } from '@metamask/permission-controller';
import type { SnapIds } from '@metamask/snaps-utils';
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
export declare function snapIdsCaveatMapper(value: Json): Pick<PermissionConstraint, 'caveats'>;
/**
 * Validates that the caveat value exists and is a non-empty object.
 *
 * @param caveat - The caveat to validate.
 * @throws If the caveat is invalid.
 */
export declare function validateSnapIdsCaveat(caveat: Caveat<string, any>): asserts caveat is Caveat<string, SnapIds>;
export declare const SnapIdsCaveatSpecification: Record<SnapCaveatType.SnapIds, RestrictedMethodCaveatSpecificationConstraint>;
