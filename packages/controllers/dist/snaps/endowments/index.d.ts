import { PermissionConstraint } from '@metamask/controllers';
import { Json } from '@metamask/utils';
export declare const endowmentPermissionBuilders: {
    readonly "endowment:network-access": Readonly<{
        readonly targetKey: import("./enum").SnapEndowments.NetworkAccess;
        readonly specificationBuilder: import("@metamask/controllers").PermissionSpecificationBuilder<import("@metamask/controllers").PermissionType.Endowment, any, {
            permissionType: import("@metamask/controllers").PermissionType.Endowment;
            targetKey: import("./enum").SnapEndowments.NetworkAccess;
            endowmentGetter: (_options?: any) => ["fetch", "WebSocket", "Request", "Headers", "Response"];
            allowedCaveats: null;
        }>;
    }>;
    readonly "endowment:long-running": Readonly<{
        readonly targetKey: import("./enum").SnapEndowments.LongRunning;
        readonly specificationBuilder: import("@metamask/controllers").PermissionSpecificationBuilder<import("@metamask/controllers").PermissionType.Endowment, any, {
            permissionType: import("@metamask/controllers").PermissionType.Endowment;
            targetKey: import("./enum").SnapEndowments.LongRunning;
            endowmentGetter: (_options?: any) => undefined;
            allowedCaveats: null;
        }>;
    }>;
    readonly "endowment:transaction-insight": Readonly<{
        readonly targetKey: import("./enum").SnapEndowments.TransactionInsight;
        readonly specificationBuilder: import("@metamask/controllers").PermissionSpecificationBuilder<import("@metamask/controllers").PermissionType.Endowment, any, {
            permissionType: import("@metamask/controllers").PermissionType.Endowment;
            targetKey: import("./enum").SnapEndowments.TransactionInsight;
            endowmentGetter: (_options?: import("@metamask/controllers").EndowmentGetterParams | undefined) => undefined;
            allowedCaveats: null;
        }>;
    }>;
    readonly "endowment:keyring": Readonly<{
        readonly targetKey: import("./enum").SnapEndowments.Keyring;
        readonly specificationBuilder: import("@metamask/controllers").PermissionSpecificationBuilder<import("@metamask/controllers").PermissionType.Endowment, {}, {
            permissionType: import("@metamask/controllers").PermissionType.Endowment;
            targetKey: import("./enum").SnapEndowments.Keyring;
            endowmentGetter: (_options?: any) => undefined;
            allowedCaveats: readonly [string, ...string[]] | null;
            validator: import("@metamask/controllers").PermissionValidatorConstraint;
        }>;
    }>;
    readonly "endowment:cronjob": Readonly<{
        readonly targetKey: import("./enum").SnapEndowments.Cronjob;
        readonly specificationBuilder: import("@metamask/controllers").PermissionSpecificationBuilder<import("@metamask/controllers").PermissionType.Endowment, any, {
            permissionType: import("@metamask/controllers").PermissionType.Endowment;
            targetKey: import("./enum").SnapEndowments.Cronjob;
            endowmentGetter: (_options?: any) => undefined;
            allowedCaveats: readonly [string, ...string[]] | null;
        }>;
    }>;
};
export declare const endowmentCaveatSpecifications: {
    snapCronjob: import("@metamask/controllers").CaveatSpecificationConstraint;
    snapKeyring: import("@metamask/controllers").CaveatSpecificationConstraint;
};
export declare const endowmentCaveatMappers: Record<string, (value: Json) => Pick<PermissionConstraint, 'caveats'>>;
export * from './enum';
