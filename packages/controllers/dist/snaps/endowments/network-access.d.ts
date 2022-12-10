import { PermissionSpecificationBuilder, PermissionType } from '@metamask/controllers';
import { SnapEndowments } from './enum';
declare const permissionName = SnapEndowments.NetworkAccess;
export declare const networkAccessEndowmentBuilder: Readonly<{
    readonly targetKey: SnapEndowments.NetworkAccess;
    readonly specificationBuilder: PermissionSpecificationBuilder<PermissionType.Endowment, any, {
        permissionType: PermissionType.Endowment;
        targetKey: typeof permissionName;
        endowmentGetter: (_options?: any) => ['fetch', 'WebSocket', 'Request', 'Headers', 'Response'];
        allowedCaveats: null;
    }>;
}>;
export {};
