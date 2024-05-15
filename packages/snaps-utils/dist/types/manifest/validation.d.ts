import type { EmptyObject, InitialPermissions } from '@metamask/snaps-sdk';
import type { Describe, Infer, Struct } from 'superstruct';
import type { InferMatching } from '../structs';
export declare const FORBIDDEN_COIN_TYPES: number[];
export declare const Bip32PathStruct: Struct<string[], Struct<string, null>>;
export declare const bip32entropy: <Type extends {
    path: string[];
    curve: string;
}, Schema>(struct: Struct<Type, Schema>) => Struct<Type, Schema>;
export declare const Bip32EntropyStruct: Struct<{
    path: string[];
    curve: "ed25519" | "secp256k1";
}, {
    path: Struct<string[], Struct<string, null>>;
    curve: Struct<"ed25519" | "secp256k1", {
        ed25519: "ed25519";
        secp256k1: "secp256k1";
    }>;
}>;
export declare type Bip32Entropy = Infer<typeof Bip32EntropyStruct>;
export declare const SnapGetBip32EntropyPermissionsStruct: Struct<{
    path: string[];
    curve: "ed25519" | "secp256k1";
}[], Struct<{
    path: string[];
    curve: "ed25519" | "secp256k1";
}, {
    path: Struct<string[], Struct<string, null>>;
    curve: Struct<"ed25519" | "secp256k1", {
        ed25519: "ed25519";
        secp256k1: "secp256k1";
    }>;
}>>;
export declare const SemVerRangeStruct: Struct<string, null>;
export declare const SnapIdsStruct: Struct<Record<string, {
    version?: string | undefined;
}>, null>;
export declare type SnapIds = Infer<typeof SnapIdsStruct>;
export declare const ChainIdsStruct: Struct<`${string}:${string}`[], Struct<`${string}:${string}`, null>>;
export declare const LookupMatchersStruct: Struct<{
    tlds: string[];
} | {
    schemes: string[];
} | {
    tlds: string[];
    schemes: string[];
}, null>;
export declare const MINIMUM_REQUEST_TIMEOUT: number;
export declare const MAXIMUM_REQUEST_TIMEOUT: number;
export declare const MaxRequestTimeStruct: Struct<number, null>;
export declare const HandlerCaveatsStruct: Struct<{
    maxRequestTime?: number | undefined;
}, {
    maxRequestTime: Struct<number | undefined, null>;
}>;
export declare type HandlerCaveats = Infer<typeof HandlerCaveatsStruct>;
export declare const EmptyObjectStruct: Struct<EmptyObject, null>;
export declare const PermissionsStruct: Describe<InitialPermissions>;
export declare type SnapPermissions = InferMatching<typeof PermissionsStruct, InitialPermissions>;
export declare const SnapAuxilaryFilesStruct: Struct<string[], Struct<string, null>>;
export declare const InitialConnectionsStruct: Struct<Record<string & URL, {}>, null>;
export declare type InitialConnections = Infer<typeof InitialConnectionsStruct>;
export declare const SnapManifestStruct: Struct<{
    description: string;
    version: import("@metamask/utils").SemVerVersion;
    source: {
        location: {
            npm: {
                registry: "https://registry.npmjs.org" | "https://registry.npmjs.org/";
                filePath: string;
                packageName: string;
                iconPath?: string | undefined;
            };
        };
        shasum: string;
        files?: string[] | undefined;
        locales?: string[] | undefined;
    };
    proposedName: string;
    initialPermissions: Partial<{
        'endowment:cronjob': {
            jobs: import("@metamask/snaps-sdk").Cronjob[];
            maxRequestTime?: number | undefined;
        };
        'endowment:ethereum-provider': EmptyObject;
        'endowment:keyring': {
            allowedOrigins?: string[] | undefined;
            maxRequestTime?: number | undefined;
        };
        'endowment:lifecycle-hooks'?: {
            maxRequestTime?: number | undefined;
        } | undefined;
        'endowment:name-lookup': {
            chains?: `${string}:${string}`[] | undefined;
            matchers?: import("@metamask/snaps-sdk").NameLookupMatchers | undefined;
            maxRequestTime?: number | undefined;
        };
        'endowment:network-access': EmptyObject;
        'endowment:page-home'?: {
            maxRequestTime?: number | undefined;
        } | undefined;
        'endowment:rpc': {
            dapps?: boolean | undefined;
            snaps?: boolean | undefined;
            allowedOrigins?: string[] | undefined;
            maxRequestTime?: number | undefined;
        };
        'endowment:signature-insight': {
            allowSignatureOrigin?: boolean | undefined;
            maxRequestTime?: number | undefined;
        };
        'endowment:transaction-insight': {
            allowTransactionOrigin?: boolean | undefined;
            maxRequestTime?: number | undefined;
        };
        'endowment:webassembly': EmptyObject;
        snap_dialog: EmptyObject;
        snap_getBip32Entropy: import("@metamask/snaps-sdk").Bip32Entropy[];
        snap_getBip32PublicKey: import("@metamask/snaps-sdk").Bip32Entropy[];
        snap_getBip44Entropy: import("@metamask/snaps-sdk").Bip44Entropy[];
        snap_getEntropy: EmptyObject;
        snap_getLocale: EmptyObject;
        snap_manageAccounts: EmptyObject;
        snap_manageState: EmptyObject;
        snap_notify: EmptyObject;
        wallet_snap: Record<string, import("@metamask/snaps-sdk").RequestedSnap>;
    }>;
    manifestVersion: "0.1";
    repository?: {
        type: string;
        url: string;
    } | undefined;
    initialConnections?: Record<string & URL, {}> | undefined;
    $schema?: string | undefined;
}, {
    version: Struct<import("@metamask/utils").SemVerVersion, null>;
    description: Struct<string, null>;
    proposedName: Struct<string, null>;
    repository: Struct<{
        type: string;
        url: string;
    } | undefined, {
        type: Struct<string, null>;
        url: Struct<string, null>;
    }>;
    source: Struct<{
        location: {
            npm: {
                registry: "https://registry.npmjs.org" | "https://registry.npmjs.org/";
                filePath: string;
                packageName: string;
                iconPath?: string | undefined;
            };
        };
        shasum: string;
        files?: string[] | undefined;
        locales?: string[] | undefined;
    }, {
        shasum: Struct<string, null>;
        location: Struct<{
            npm: {
                registry: "https://registry.npmjs.org" | "https://registry.npmjs.org/";
                filePath: string;
                packageName: string;
                iconPath?: string | undefined;
            };
        }, {
            npm: Struct<{
                registry: "https://registry.npmjs.org" | "https://registry.npmjs.org/";
                filePath: string;
                packageName: string;
                iconPath?: string | undefined;
            }, {
                filePath: Struct<string, null>;
                iconPath: Struct<string | undefined, null>;
                packageName: Struct<string, null>;
                registry: Struct<"https://registry.npmjs.org" | "https://registry.npmjs.org/", null>;
            }>;
        }>;
        files: Struct<string[] | undefined, Struct<string, null>>;
        locales: Struct<string[] | undefined, Struct<string, null>>;
    }>;
    initialConnections: Struct<Record<string & URL, {}> | undefined, null>;
    initialPermissions: Describe<Partial<{
        'endowment:cronjob': {
            jobs: import("@metamask/snaps-sdk").Cronjob[];
            maxRequestTime?: number | undefined;
        };
        'endowment:ethereum-provider': EmptyObject;
        'endowment:keyring': {
            allowedOrigins?: string[] | undefined;
            maxRequestTime?: number | undefined;
        };
        'endowment:lifecycle-hooks'?: {
            maxRequestTime?: number | undefined;
        } | undefined;
        'endowment:name-lookup': {
            chains?: `${string}:${string}`[] | undefined;
            matchers?: import("@metamask/snaps-sdk").NameLookupMatchers | undefined;
            maxRequestTime?: number | undefined;
        };
        'endowment:network-access': EmptyObject;
        'endowment:page-home'?: {
            maxRequestTime?: number | undefined;
        } | undefined;
        'endowment:rpc': {
            dapps?: boolean | undefined;
            snaps?: boolean | undefined;
            allowedOrigins?: string[] | undefined;
            maxRequestTime?: number | undefined;
        };
        'endowment:signature-insight': {
            allowSignatureOrigin?: boolean | undefined;
            maxRequestTime?: number | undefined;
        };
        'endowment:transaction-insight': {
            allowTransactionOrigin?: boolean | undefined;
            maxRequestTime?: number | undefined;
        };
        'endowment:webassembly': EmptyObject;
        snap_dialog: EmptyObject;
        snap_getBip32Entropy: import("@metamask/snaps-sdk").Bip32Entropy[];
        snap_getBip32PublicKey: import("@metamask/snaps-sdk").Bip32Entropy[];
        snap_getBip44Entropy: import("@metamask/snaps-sdk").Bip44Entropy[];
        snap_getEntropy: EmptyObject;
        snap_getLocale: EmptyObject;
        snap_manageAccounts: EmptyObject;
        snap_manageState: EmptyObject;
        snap_notify: EmptyObject;
        wallet_snap: Record<string, import("@metamask/snaps-sdk").RequestedSnap>;
    }>>;
    manifestVersion: Struct<"0.1", "0.1">;
    $schema: Struct<string | undefined, null>;
}>;
export declare type SnapManifest = Infer<typeof SnapManifestStruct>;
/**
 * Check if the given value is a valid {@link SnapManifest} object.
 *
 * @param value - The value to check.
 * @returns Whether the value is a valid {@link SnapManifest} object.
 */
export declare function isSnapManifest(value: unknown): value is SnapManifest;
/**
 * Assert that the given value is a valid {@link SnapManifest} object.
 *
 * @param value - The value to check.
 * @throws If the value is not a valid {@link SnapManifest} object.
 */
export declare function assertIsSnapManifest(value: unknown): asserts value is SnapManifest;
/**
 * Creates a {@link SnapManifest} object from JSON.
 *
 * @param value - The value to check.
 * @throws If the value cannot be coerced to a {@link SnapManifest} object.
 * @returns The created {@link SnapManifest} object.
 */
export declare function createSnapManifest(value: unknown): SnapManifest;
