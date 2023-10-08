import type { PermissionSpecificationBuilder, EndowmentGetterParams, PermissionValidatorConstraint, PermissionConstraint, CaveatSpecificationConstraint } from '@metamask/permission-controller';
import { PermissionType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';
import type { Json, NonEmptyArray } from '@metamask/utils';
import { SnapEndowments } from './enum';
declare const permissionName = SnapEndowments.TransactionInsight;
export declare const transactionInsightEndowmentBuilder: Readonly<{
    readonly targetName: SnapEndowments.TransactionInsight;
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
export declare function getTransactionInsightCaveatMapper(value: Json): Pick<PermissionConstraint, 'caveats'>;
/**
 * Getter function to get the transaction origin caveat from a permission.
 *
 * This does basic validation of the caveat, but does not validate the type or
 * value of the namespaces object itself, as this is handled by the
 * `PermissionsController` when the permission is requested.
 *
 * @param permission - The permission to get the transaction origin caveat from.
 * @returns The transaction origin, or `null` if the permission does not have a
 * transaction origin caveat.
 */
export declare function getTransactionOriginCaveat(permission?: PermissionConstraint): boolean | null;
export declare const transactionInsightCaveatSpecifications: Record<SnapCaveatType.TransactionOrigin, CaveatSpecificationConstraint>;
export {};
