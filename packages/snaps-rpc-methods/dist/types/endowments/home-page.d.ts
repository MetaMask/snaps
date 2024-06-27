import type { PermissionSpecificationBuilder, EndowmentGetterParams } from '@metamask/permission-controller';
import { PermissionType } from '@metamask/permission-controller';
import type { NonEmptyArray } from '@metamask/utils';
import { SnapEndowments } from './enum';
declare const permissionName = SnapEndowments.HomePage;
export declare const homePageEndowmentBuilder: Readonly<{
    readonly targetName: SnapEndowments.HomePage;
    readonly specificationBuilder: PermissionSpecificationBuilder<PermissionType.Endowment, any, {
        permissionType: PermissionType.Endowment;
        targetName: typeof permissionName;
        endowmentGetter: (_options?: EndowmentGetterParams) => null;
        allowedCaveats: Readonly<NonEmptyArray<string>> | null;
    }>;
}>;
export {};
