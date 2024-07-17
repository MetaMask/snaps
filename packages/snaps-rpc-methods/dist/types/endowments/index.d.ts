import type { PermissionConstraint } from '@metamask/permission-controller';
import { HandlerType } from '@metamask/snaps-utils';
import type { Json } from '@metamask/utils';
export declare const endowmentPermissionBuilders: {
    readonly "endowment:network-access": Readonly<{
        readonly targetName: import("./enum").SnapEndowments.NetworkAccess;
        readonly specificationBuilder: import("@metamask/permission-controller").PermissionSpecificationBuilder<import("@metamask/permission-controller").PermissionType.Endowment, any, {
            permissionType: import("@metamask/permission-controller").PermissionType.Endowment;
            targetName: import("./enum").SnapEndowments.NetworkAccess;
            endowmentGetter: (_options?: any) => ["fetch", "Request", "Headers", "Response"];
            allowedCaveats: null;
        }>;
    }>;
    readonly "endowment:transaction-insight": Readonly<{
        readonly targetName: import("./enum").SnapEndowments.TransactionInsight;
        readonly specificationBuilder: import("@metamask/permission-controller").PermissionSpecificationBuilder<import("@metamask/permission-controller").PermissionType.Endowment, any, {
            permissionType: import("@metamask/permission-controller").PermissionType.Endowment;
            targetName: import("./enum").SnapEndowments.TransactionInsight;
            endowmentGetter: (_options?: import("@metamask/permission-controller").EndowmentGetterParams | undefined) => null;
            allowedCaveats: readonly [string, ...string[]] | null;
            validator: import("@metamask/permission-controller").PermissionValidatorConstraint;
        }>;
    }>;
    readonly "endowment:cronjob": Readonly<{
        readonly targetName: import("./enum").SnapEndowments.Cronjob;
        readonly specificationBuilder: import("@metamask/permission-controller").PermissionSpecificationBuilder<import("@metamask/permission-controller").PermissionType.Endowment, any, {
            permissionType: import("@metamask/permission-controller").PermissionType.Endowment;
            targetName: import("./enum").SnapEndowments.Cronjob;
            endowmentGetter: (_options?: any) => null;
            allowedCaveats: readonly [string, ...string[]] | null;
        }>;
    }>;
    readonly "endowment:ethereum-provider": Readonly<{
        readonly targetName: import("./enum").SnapEndowments.EthereumProvider;
        readonly specificationBuilder: import("@metamask/permission-controller").PermissionSpecificationBuilder<import("@metamask/permission-controller").PermissionType.Endowment, any, {
            permissionType: import("@metamask/permission-controller").PermissionType.Endowment;
            targetName: import("./enum").SnapEndowments.EthereumProvider;
            endowmentGetter: (_options?: any) => ["ethereum"];
            allowedCaveats: null;
        }>;
    }>;
    readonly "endowment:rpc": Readonly<{
        readonly targetName: import("./enum").SnapEndowments.Rpc;
        readonly specificationBuilder: import("@metamask/permission-controller").PermissionSpecificationBuilder<import("@metamask/permission-controller").PermissionType.Endowment, {}, {
            permissionType: import("@metamask/permission-controller").PermissionType.Endowment;
            targetName: import("./enum").SnapEndowments.Rpc;
            endowmentGetter: (_options?: any) => null;
            allowedCaveats: readonly [string, ...string[]] | null;
            validator: import("@metamask/permission-controller").PermissionValidatorConstraint;
            subjectTypes: readonly import("@metamask/permission-controller").SubjectType[];
        }>;
    }>;
    readonly "endowment:webassembly": Readonly<{
        readonly targetName: import("./enum").SnapEndowments.WebAssemblyAccess;
        readonly specificationBuilder: import("@metamask/permission-controller").PermissionSpecificationBuilder<import("@metamask/permission-controller").PermissionType.Endowment, any, {
            permissionType: import("@metamask/permission-controller").PermissionType.Endowment;
            targetName: import("./enum").SnapEndowments.WebAssemblyAccess;
            endowmentGetter: (_options?: any) => ["WebAssembly"];
            allowedCaveats: null;
        }>;
    }>;
    readonly "endowment:name-lookup": Readonly<{
        readonly targetName: import("./enum").SnapEndowments.NameLookup;
        readonly specificationBuilder: import("@metamask/permission-controller").PermissionSpecificationBuilder<import("@metamask/permission-controller").PermissionType.Endowment, any, {
            permissionType: import("@metamask/permission-controller").PermissionType.Endowment;
            targetName: import("./enum").SnapEndowments.NameLookup;
            endowmentGetter: (_options?: import("@metamask/permission-controller").EndowmentGetterParams | undefined) => null;
            allowedCaveats: readonly [string, ...string[]] | null;
            validator: import("@metamask/permission-controller").PermissionValidatorConstraint;
        }>;
    }>;
    readonly "endowment:lifecycle-hooks": Readonly<{
        readonly targetName: import("./enum").SnapEndowments.LifecycleHooks;
        readonly specificationBuilder: import("@metamask/permission-controller").PermissionSpecificationBuilder<import("@metamask/permission-controller").PermissionType.Endowment, any, {
            permissionType: import("@metamask/permission-controller").PermissionType.Endowment;
            targetName: import("./enum").SnapEndowments.LifecycleHooks;
            endowmentGetter: (_options?: import("@metamask/permission-controller").EndowmentGetterParams | undefined) => null;
            allowedCaveats: readonly [string, ...string[]] | null;
        }>;
    }>;
    readonly "endowment:keyring": Readonly<{
        readonly targetName: import("./enum").SnapEndowments.Keyring;
        readonly specificationBuilder: import("@metamask/permission-controller").PermissionSpecificationBuilder<import("@metamask/permission-controller").PermissionType.Endowment, any, {
            permissionType: import("@metamask/permission-controller").PermissionType.Endowment;
            targetName: import("./enum").SnapEndowments.Keyring;
            endowmentGetter: (_options?: import("@metamask/permission-controller").EndowmentGetterParams | undefined) => null;
            allowedCaveats: readonly [string, ...string[]] | null;
            validator: import("@metamask/permission-controller").PermissionValidatorConstraint;
            subjectTypes: readonly import("@metamask/permission-controller").SubjectType[];
        }>;
    }>;
    readonly "endowment:page-home": Readonly<{
        readonly targetName: import("./enum").SnapEndowments.HomePage;
        readonly specificationBuilder: import("@metamask/permission-controller").PermissionSpecificationBuilder<import("@metamask/permission-controller").PermissionType.Endowment, any, {
            permissionType: import("@metamask/permission-controller").PermissionType.Endowment;
            targetName: import("./enum").SnapEndowments.HomePage;
            endowmentGetter: (_options?: import("@metamask/permission-controller").EndowmentGetterParams | undefined) => null;
            allowedCaveats: readonly [string, ...string[]] | null;
        }>;
    }>;
    readonly "endowment:signature-insight": Readonly<{
        readonly targetName: import("./enum").SnapEndowments.SignatureInsight;
        readonly specificationBuilder: import("@metamask/permission-controller").PermissionSpecificationBuilder<import("@metamask/permission-controller").PermissionType.Endowment, any, {
            permissionType: import("@metamask/permission-controller").PermissionType.Endowment;
            targetName: import("./enum").SnapEndowments.SignatureInsight;
            endowmentGetter: (_options?: import("@metamask/permission-controller").EndowmentGetterParams | undefined) => null;
            allowedCaveats: readonly [string, ...string[]] | null;
            validator: import("@metamask/permission-controller").PermissionValidatorConstraint;
        }>;
    }>;
};
export declare const endowmentCaveatSpecifications: {
    maxRequestTime: import("@metamask/permission-controller").CaveatSpecificationConstraint;
    signatureOrigin: import("@metamask/permission-controller").CaveatSpecificationConstraint;
    keyringOrigin: import("@metamask/permission-controller").CaveatSpecificationConstraint;
    chainIds: import("@metamask/permission-controller").CaveatSpecificationConstraint;
    lookupMatchers: import("@metamask/permission-controller").CaveatSpecificationConstraint;
    rpcOrigin: import("@metamask/permission-controller").CaveatSpecificationConstraint;
    transactionOrigin: import("@metamask/permission-controller").CaveatSpecificationConstraint;
    snapCronjob: import("@metamask/permission-controller").CaveatSpecificationConstraint;
};
export declare const endowmentCaveatMappers: Record<string, (value: Json) => Pick<PermissionConstraint, 'caveats'>>;
export declare const handlerEndowments: Record<HandlerType, string | null>;
export * from './enum';
export { getRpcCaveatOrigins } from './rpc';
export { getSignatureOriginCaveat } from './signature-insight';
export { getTransactionOriginCaveat } from './transaction-insight';
export { getChainIdsCaveat, getLookupMatchersCaveat } from './name-lookup';
export { getKeyringCaveatOrigins } from './keyring';
export { getMaxRequestTimeCaveat } from './caveats';
export { getCronjobCaveatJobs } from './cronjob';
