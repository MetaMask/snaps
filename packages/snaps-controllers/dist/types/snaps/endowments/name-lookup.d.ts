import type { EndowmentGetterParams, PermissionSpecificationBuilder, PermissionValidatorConstraint, CaveatSpecificationConstraint, PermissionConstraint } from '@metamask/permission-controller';
import { PermissionType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';
import type { Json, NonEmptyArray } from '@metamask/utils';
import { SnapEndowments } from './enum';
declare const permissionName = SnapEndowments.NameLookup;
export declare const nameLookupEndowmentBuilder: Readonly<{
    readonly targetName: SnapEndowments.NameLookup;
    readonly specificationBuilder: PermissionSpecificationBuilder<PermissionType.Endowment, any, {
        permissionType: PermissionType.Endowment;
        targetName: typeof permissionName;
        endowmentGetter: (_options?: EndowmentGetterParams) => undefined;
        allowedCaveats: Readonly<NonEmptyArray<string>> | null;
        validator: PermissionValidatorConstraint;
    }>;
}>;
/**
 * Map a raw value from the `initialPermissions` to a caveat specification.
 * Note that this function does not do any validation, that's handled by the
 * PermissionsController when the permission is requested.
 *
 * @param value - The raw value from the `initialPermissions`.
 * @returns The caveat specification.
 */
export declare function getNameLookupCaveatMapper(value: Json): Pick<PermissionConstraint, 'caveats'>;
/**
 * Getter function to get the chainIds caveat from a permission.
 *
 * This does basic validation of the caveat, but does not validate the type or
 * value of the namespaces object itself, as this is handled by the
 * `PermissionsController` when the permission is requested.
 *
 * @param permission - The permission to get the `chainIds` caveat from.
 * @returns An array of `chainIds` that the snap supports.
 */
export declare function getChainIdsCaveat(permission?: PermissionConstraint): string[] | null;
export declare const nameLookupCaveatSpecifications: Record<SnapCaveatType.ChainIds, CaveatSpecificationConstraint>;
export {};
