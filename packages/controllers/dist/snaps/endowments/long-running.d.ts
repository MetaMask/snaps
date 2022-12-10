import { PermissionSpecificationBuilder, PermissionType } from '@metamask/controllers';
import { SnapEndowments } from './enum';
declare const permissionName = SnapEndowments.LongRunning;
export declare const longRunningEndowmentBuilder: Readonly<{
    readonly targetKey: SnapEndowments.LongRunning;
    readonly specificationBuilder: PermissionSpecificationBuilder<PermissionType.Endowment, any, {
        permissionType: PermissionType.Endowment;
        targetKey: typeof permissionName;
        endowmentGetter: (_options?: any) => undefined;
        allowedCaveats: null;
    }>;
}>;
export {};
