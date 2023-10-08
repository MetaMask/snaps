import type { CaveatSpecificationConstraint, PermissionConstraint, PermissionSpecificationBuilder, PermissionValidatorConstraint } from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import type { RpcOrigins } from '@metamask/snaps-utils';
import { SnapCaveatType } from '@metamask/snaps-utils';
import type { Json, NonEmptyArray } from '@metamask/utils';
import { SnapEndowments } from './enum';
declare const targetName = SnapEndowments.Rpc;
declare type RpcSpecificationBuilderOptions = {};
export declare const rpcEndowmentBuilder: Readonly<{
    readonly targetName: SnapEndowments.Rpc;
    readonly specificationBuilder: PermissionSpecificationBuilder<PermissionType.Endowment, RpcSpecificationBuilderOptions, {
        permissionType: PermissionType.Endowment;
        targetName: typeof targetName;
        endowmentGetter: (_options?: any) => undefined;
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
export declare function getRpcCaveatMapper(value: Json): Pick<PermissionConstraint, 'caveats'>;
/**
 * Getter function to get the {@link RpcOrigins} caveat value from a permission.
 *
 * @param permission - The permission to get the caveat value from.
 * @returns The caveat value.
 * @throws If the permission does not have a valid {@link RpcOrigins} caveat.
 */
export declare function getRpcCaveatOrigins(permission?: PermissionConstraint): RpcOrigins | null;
export declare const rpcCaveatSpecifications: Record<SnapCaveatType.RpcOrigin, CaveatSpecificationConstraint>;
export {};
