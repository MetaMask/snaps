import type { PermissionSpecificationBuilder, ValidPermissionSpecification, RestrictedMethodOptions, RestrictedMethodParameters } from '@metamask/permission-controller';
import { PermissionType } from '@metamask/permission-controller';
import type { GetLocaleResult } from '@metamask/snaps-sdk';
import type { NonEmptyArray } from '@metamask/utils';
import type { MethodHooksObject } from '../utils';
declare const methodName = "snap_getLocale";
export declare type GetLocaleMethodHooks = {
    getLocale: () => Promise<string>;
};
declare type SpecificationBuilderOptions = {
    allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
    methodHooks: GetLocaleMethodHooks;
};
declare type Specification = ValidPermissionSpecification<{
    permissionType: PermissionType.RestrictedMethod;
    targetName: typeof methodName;
    methodImplementation: ReturnType<typeof getImplementation>;
    allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;
/**
 * The specification builder for the `snap_getLocale` permission.
 * `snap_getLocale` allows snaps to get the user selected locale.
 *
 * @param options - The specification builder options.
 * @param options.allowedCaveats - The optional allowed caveats for the permission.
 * @param options.methodHooks - The RPC method hooks needed by the method implementation.
 * @returns The specification for the `snap_getLocale` permission.
 */
export declare const specificationBuilder: PermissionSpecificationBuilder<PermissionType.RestrictedMethod, SpecificationBuilderOptions, Specification>;
export declare const getLocaleBuilder: Readonly<{
    readonly targetName: "snap_getLocale";
    readonly specificationBuilder: PermissionSpecificationBuilder<PermissionType.RestrictedMethod, SpecificationBuilderOptions, {
        permissionType: PermissionType.RestrictedMethod;
        targetName: typeof methodName;
        methodImplementation: ReturnType<typeof getImplementation>;
        allowedCaveats: Readonly<NonEmptyArray<string>> | null;
    }>;
    readonly methodHooks: MethodHooksObject<GetLocaleMethodHooks>;
}>;
/**
 * Builds the method implementation for `snap_getLocale`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.getLocale - A function that returns the user selected locale.
 * @returns The user selected locale.
 */
export declare function getImplementation({ getLocale }: GetLocaleMethodHooks): (_args: RestrictedMethodOptions<RestrictedMethodParameters>) => Promise<GetLocaleResult>;
export {};
