import type { VirtualFile } from '@metamask/snaps-utils';
import type { Validator } from './validators';
export declare enum ManifestStatus {
    Valid = "valid",
    Invalid = "invalid",
    Unknown = "unknown"
}
export declare type ValidationResult = Omit<Validator, 'validator'> & {
    isValid: boolean;
    message?: string | undefined;
};
export declare type ManifestState = {
    valid: ManifestStatus;
    results: ValidationResult[];
};
export declare const INITIAL_MANIFEST_STATE: ManifestState;
export declare const validateManifest: import("@reduxjs/toolkit").ActionCreatorWithPayload<VirtualFile<{
    description: string;
    version: import("@metamask/utils").SemVerVersion;
    source: {
        location: {
            npm: {
                registry: "https://registry.npmjs.org/" | "https://registry.npmjs.org";
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
        'endowment:ethereum-provider': import("@metamask/snaps-sdk").EmptyObject;
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
        'endowment:network-access': import("@metamask/snaps-sdk").EmptyObject;
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
        'endowment:webassembly': import("@metamask/snaps-sdk").EmptyObject;
        snap_dialog: import("@metamask/snaps-sdk").EmptyObject;
        snap_getBip32Entropy: import("@metamask/snaps-sdk").Bip32Entropy[];
        snap_getBip32PublicKey: import("@metamask/snaps-sdk").Bip32Entropy[];
        snap_getBip44Entropy: import("@metamask/snaps-sdk").Bip44Entropy[];
        snap_getEntropy: import("@metamask/snaps-sdk").EmptyObject;
        snap_getLocale: import("@metamask/snaps-sdk").EmptyObject;
        snap_manageAccounts: import("@metamask/snaps-sdk").EmptyObject;
        snap_manageState: import("@metamask/snaps-sdk").EmptyObject;
        snap_notify: import("@metamask/snaps-sdk").EmptyObject;
        wallet_snap: Record<string, import("@metamask/snaps-sdk").RequestedSnap>;
    }>;
    manifestVersion: "0.1";
    repository?: {
        type: string;
        url: string;
    } | undefined;
    initialConnections?: Record<string & URL, {}> | undefined;
    $schema?: string | undefined;
}>, string>;
export declare const setValid: import("@reduxjs/toolkit").ActionCreatorWithPayload<ManifestStatus, "manifest/setValid">, setResults: import("@reduxjs/toolkit").ActionCreatorWithPayload<ValidationResult[], "manifest/setResults">;
export declare const manifest: import("redux").Reducer<ManifestState, import("redux").AnyAction>;
export declare const getManifestStatus: ((state: {
    manifest: ManifestState;
}) => ManifestStatus) & import("reselect").OutputSelectorFields<(args_0: ManifestState) => ManifestStatus, {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
export declare const getManifestResults: ((state: {
    manifest: ManifestState;
}) => ValidationResult[]) & import("reselect").OutputSelectorFields<(args_0: ManifestState) => ValidationResult[], {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
