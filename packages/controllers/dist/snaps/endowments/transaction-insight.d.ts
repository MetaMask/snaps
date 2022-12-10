import { PermissionSpecificationBuilder, PermissionType, EndowmentGetterParams } from '@metamask/controllers';
import { SnapEndowments } from './enum';
declare const permissionName = SnapEndowments.TransactionInsight;
export declare const transactionInsightEndowmentBuilder: Readonly<{
    readonly targetKey: SnapEndowments.TransactionInsight;
    readonly specificationBuilder: PermissionSpecificationBuilder<PermissionType.Endowment, any, {
        permissionType: PermissionType.Endowment;
        targetKey: typeof permissionName;
        endowmentGetter: (_options?: EndowmentGetterParams | undefined) => undefined;
        allowedCaveats: null;
    }>;
}>;
export {};
