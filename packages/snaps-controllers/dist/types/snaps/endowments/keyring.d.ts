import type { CaveatSpecificationConstraint, EndowmentGetterParams, PermissionConstraint, PermissionSpecificationBuilder, PermissionValidatorConstraint } from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import type { KeyringOrigins } from '@metamask/snaps-utils';
import { SnapCaveatType } from '@metamask/snaps-utils';
import type { Json, NonEmptyArray } from '@metamask/utils';
import { SnapEndowments } from './enum';
declare const permissionName = SnapEndowments.Keyring;
export declare const keyringEndowmentBuilder: Readonly<{
    readonly targetName: SnapEndowments.Keyring;
    readonly specificationBuilder: PermissionSpecificationBuilder<PermissionType.Endowment, any, {
        permissionType: PermissionType.Endowment;
        targetName: typeof permissionName;
        endowmentGetter: (_options?: EndowmentGetterParams) => undefined;
        allowedCaveats: Readonly<NonEmptyArray<string>> | null;
        validator: PermissionValidatorConstraint;
        subjectTypes: readonly SubjectType[];
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
 * Getter function to get the {@link KeyringOrigins} caveat value from a
 * permission.
 *
 * @param permission - The permission to get the caveat value from.
 * @returns The caveat value.
 * @throws If the permission does not have a valid {@link KeyringOrigins}
 * caveat.
 */
export declare function getKeyringCaveatOrigins(permission?: PermissionConstraint): KeyringOrigins | null;
export declare const keyringCaveatSpecifications: Record<SnapCaveatType.KeyringOrigin, CaveatSpecificationConstraint>;
export {};
