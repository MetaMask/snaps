import type { PermissionSpecificationBuilder } from '@metamask/permission-controller';
import { PermissionType } from '@metamask/permission-controller';
import { SnapEndowments } from './enum';
declare const permissionName = SnapEndowments.WebAssemblyAccess;
export declare const webAssemblyEndowmentBuilder: Readonly<{
    readonly targetName: SnapEndowments.WebAssemblyAccess;
    readonly specificationBuilder: PermissionSpecificationBuilder<PermissionType.Endowment, any, {
        permissionType: PermissionType.Endowment;
        targetName: typeof permissionName;
        endowmentGetter: (_options?: any) => ['WebAssembly'];
        allowedCaveats: null;
    }>;
}>;
export {};
