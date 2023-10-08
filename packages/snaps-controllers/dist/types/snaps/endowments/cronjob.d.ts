import type { PermissionSpecificationBuilder, PermissionConstraint, Caveat, CaveatSpecificationConstraint } from '@metamask/permission-controller';
import { PermissionType } from '@metamask/permission-controller';
import type { CronjobSpecification } from '@metamask/snaps-utils';
import { SnapCaveatType } from '@metamask/snaps-utils';
import type { Json, NonEmptyArray } from '@metamask/utils';
import { SnapEndowments } from './enum';
declare const permissionName = SnapEndowments.Cronjob;
export declare const cronjobEndowmentBuilder: Readonly<{
    readonly targetName: SnapEndowments.Cronjob;
    readonly specificationBuilder: PermissionSpecificationBuilder<PermissionType.Endowment, any, {
        permissionType: PermissionType.Endowment;
        targetName: typeof permissionName;
        endowmentGetter: (_options?: any) => undefined;
        allowedCaveats: Readonly<NonEmptyArray<string>> | null;
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
export declare function getCronjobCaveatMapper(value: Json): Pick<PermissionConstraint, 'caveats'>;
/**
 * Getter function to get the cronjobs from a permission.
 *
 * This does basic validation of the caveat, but does not validate the type or
 * value of the namespaces object itself, as this is handled by the
 * `PermissionsController` when the permission is requested.
 *
 * @param permission - The permission to get the keyring namespaces from.
 * @returns The cronjobs, or `null` if the permission does not have a
 * cronjob caveat.
 */
export declare function getCronjobCaveatJobs(permission?: PermissionConstraint): CronjobSpecification[] | null;
/**
 * Validate the cronjob specification values associated with a caveat.
 * This validates that the value is a non-empty array with valid
 * cronjob expression and request object.
 *
 * @param caveat - The caveat to validate.
 * @throws If the value is invalid.
 */
export declare function validateCronjobCaveat(caveat: Caveat<string, any>): void;
/**
 * Caveat specification for the Cronjob.
 */
export declare const cronjobCaveatSpecifications: Record<SnapCaveatType.SnapCronjob, CaveatSpecificationConstraint>;
export {};
