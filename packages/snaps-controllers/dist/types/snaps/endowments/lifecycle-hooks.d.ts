import type { PermissionSpecificationBuilder, EndowmentGetterParams } from '@metamask/permission-controller';
import { PermissionType } from '@metamask/permission-controller';
import type { NonEmptyArray } from '@metamask/utils';
import { SnapEndowments } from './enum';
declare const permissionName = SnapEndowments.LifecycleHooks;
export declare const lifecycleHooksEndowmentBuilder: Readonly<{
    readonly targetName: SnapEndowments.LifecycleHooks;
    readonly specificationBuilder: PermissionSpecificationBuilder<PermissionType.Endowment, any, {
        permissionType: PermissionType.Endowment;
        targetName: typeof permissionName;
        endowmentGetter: (_options?: EndowmentGetterParams) => undefined;
        allowedCaveats: Readonly<NonEmptyArray<string>> | null;
    }>;
}>;
export {};
