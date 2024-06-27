import { VirtualFile } from '@metamask/snaps-utils';
import { ManifestStatus } from '../manifest';
import { SnapStatus } from '../simulation';
/**
 * The fetching saga, fetches the snap manifest from the selected snap URL and checks if the checksum matches the cached value.
 * If the checksum doesn't match, it fetches the snap source code and updates that in the simulation slice.
 *
 * @yields Selects the snap URL and checksum, calls fetch to fetch the manifest, puts updates to the manifest and source code.
 */
export declare function fetchingSaga(): Generator<import("redux-saga/effects").SelectEffect | import("redux-saga/effects").PutEffect<{
    payload: SnapStatus;
    type: "simulation/setStatus";
}> | import("redux-saga/effects").CallEffect<VirtualFile<unknown>> | import("redux-saga/effects").PutEffect<{
    payload: ManifestStatus;
    type: "manifest/setValid";
}> | import("redux-saga/effects").PutEffect<{
    payload: string;
    type: "console/addDefault";
}> | import("redux-saga/effects").PutEffect<{
    payload: VirtualFile<string>;
    type: "simulation/setSourceCode";
}> | import("redux-saga/effects").CallEffect<VirtualFile<unknown>[]> | import("redux-saga/effects").PutEffect<{
    payload: VirtualFile<unknown>[];
    type: "simulation/setAuxiliaryFiles";
}> | import("redux-saga/effects").PutEffect<{
    payload: VirtualFile<{
        locale: string;
        messages: Record<string, {
            message: string;
            description?: string | undefined;
        }>;
    }>[];
    type: "simulation/setLocalizationFiles";
}> | import("redux-saga/effects").PutEffect<{
    payload: VirtualFile<string>;
    type: "simulation/setIcon";
}> | import("redux-saga/effects").PutEffect<{
    payload: VirtualFile<{
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
    }>;
    type: string;
}>, void, string & VirtualFile<{
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
}> & {
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
} & VirtualFile<string> & VirtualFile<unknown>[] & VirtualFile<{
    locale: string;
    messages: Record<string, {
        message: string;
        description?: string | undefined;
    }>;
}>[]>;
/**
 * The polling saga, runs the fetching saga in an infinite loop with a delay.
 *
 * @yields A call to fetchingSaga and a delay.
 */
export declare function pollingSaga(): Generator<import("redux-saga/effects").SelectEffect | import("redux-saga/effects").CallEffect<void> | import("redux-saga/effects").PutEffect<{
    payload: SnapStatus;
    type: "simulation/setStatus";
}> | import("redux-saga/effects").PutEffect<{
    payload: Error;
    type: "console/addError";
}> | import("redux-saga/effects").PutEffect<{
    payload: ManifestStatus;
    type: "manifest/setValid";
}> | import("redux-saga/effects").CallEffect<true>, void, string>;
/**
 * The root polling saga which runs all sagas in this file.
 *
 * @yields All sagas for the polling feature.
 */
export declare function rootPollingSaga(): Generator<import("redux-saga/effects").AllEffect<import("redux-saga/effects").ForkEffect<never>>, void, unknown>;
