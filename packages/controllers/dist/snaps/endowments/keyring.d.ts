import { Namespaces, SnapCaveatType } from '@metamask/snap-utils';
import { CaveatSpecificationConstraint, PermissionConstraint, PermissionSpecificationBuilder, PermissionType, PermissionValidatorConstraint } from '@metamask/controllers';
import { Json, NonEmptyArray } from '@metamask/utils';
import { SnapEndowments } from './enum';
declare const targetKey = SnapEndowments.Keyring;
declare type KeyringSpecificationBuilderOptions = {};
export declare const keyringEndowmentBuilder: Readonly<{
    readonly targetKey: SnapEndowments.Keyring;
    readonly specificationBuilder: PermissionSpecificationBuilder<PermissionType.Endowment, KeyringSpecificationBuilderOptions, {
        permissionType: PermissionType.Endowment;
        targetKey: typeof targetKey;
        endowmentGetter: (_options?: any) => undefined;
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
export declare function getKeyringCaveatMapper(value: Json): Pick<PermissionConstraint, 'caveats'>;
/**
 * Getter function to get the keyring namespaces from a permission.
 *
 * This does basic validation of the caveat, but does not validate the type or
 * value of the namespaces object itself, as this is handled by the
 * `PermissionsController` when the permission is requested.
 *
 * @param permission - The permission to get the keyring namespaces from.
 * @returns The keyring namespaces, or `null` if the permission does not have a
 * keyring caveat.
 */
export declare function getKeyringCaveatNamespaces(permission?: PermissionConstraint): Namespaces | null;
export declare const keyringCaveatSpecifications: Record<SnapCaveatType.SnapKeyring, CaveatSpecificationConstraint>;
export {};
