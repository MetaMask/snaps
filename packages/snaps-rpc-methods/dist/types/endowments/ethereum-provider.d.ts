import type { PermissionSpecificationBuilder } from '@metamask/permission-controller';
import { PermissionType } from '@metamask/permission-controller';
import { SnapEndowments } from './enum';
declare const permissionName = SnapEndowments.EthereumProvider;
export declare const ethereumProviderEndowmentBuilder: Readonly<{
    readonly targetName: SnapEndowments.EthereumProvider;
    readonly specificationBuilder: PermissionSpecificationBuilder<PermissionType.Endowment, any, {
        permissionType: PermissionType.Endowment;
        targetName: typeof permissionName;
        endowmentGetter: (_options?: any) => ['ethereum'];
        allowedCaveats: null;
    }>;
}>;
export {};
