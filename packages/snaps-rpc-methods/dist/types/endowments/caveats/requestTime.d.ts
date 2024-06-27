import type { CaveatSpecificationConstraint, PermissionConstraint } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';
import type { Json } from '@metamask/utils';
import type { CaveatMapperFunction, CaveatMapperReturnValue } from './generic';
/**
 * Map a raw value from the `initialPermissions` to a caveat specification.
 * Note that this function does not do any validation, that's handled by the
 * PermissionsController when the permission is requested.
 *
 * @param value - The raw value from the `initialPermissions`.
 * @returns The caveat specification.
 */
export declare function getMaxRequestTimeCaveatMapper(value: Json): CaveatMapperReturnValue;
/**
 * Creates a wrapping caveat mapper that creates the `maxRequestTime` caveat
 * and merges it with any other caveats created by the mapper function.
 *
 * @param mapper - Another caveat mapper function.
 * @returns The caveat specification.
 */
export declare function createMaxRequestTimeMapper(mapper: CaveatMapperFunction): CaveatMapperFunction;
/**
 * Getter function to get the {@link MaxRequestTime} caveat value from a permission if specified.
 *
 * @param permission - The permission to get the caveat value from.
 * @returns The caveat value if present, otherwise null.
 */
export declare function getMaxRequestTimeCaveat(permission?: PermissionConstraint): number | null;
export declare const maxRequestTimeCaveatSpecifications: Record<SnapCaveatType.MaxRequestTime, CaveatSpecificationConstraint>;
