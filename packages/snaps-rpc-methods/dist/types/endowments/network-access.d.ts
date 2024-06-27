import type { PermissionSpecificationBuilder } from '@metamask/permission-controller';
import { PermissionType } from '@metamask/permission-controller';
import { SnapEndowments } from './enum';
declare const permissionName = SnapEndowments.NetworkAccess;
export declare const networkAccessEndowmentBuilder: Readonly<{
    readonly targetName: SnapEndowments.NetworkAccess;
    readonly specificationBuilder: PermissionSpecificationBuilder<PermissionType.Endowment, any, {
        permissionType: PermissionType.Endowment;
        targetName: typeof permissionName;
        endowmentGetter: (_options?: any) => ['fetch', 'Request', 'Headers', 'Response'];
        allowedCaveats: null;
    }>;
}>;
export {};
