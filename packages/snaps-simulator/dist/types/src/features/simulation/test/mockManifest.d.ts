import { VirtualFile } from '@metamask/snaps-utils';
import type { SemVerVersion } from '@metamask/utils';
export declare const MOCK_MANIFEST: {
    version: SemVerVersion;
    description: string;
    proposedName: string;
    repository: {
        type: "git";
        url: string;
    };
    source: {
        shasum: string;
        location: {
            npm: {
                readonly filePath: "dist/bundle.js";
                readonly packageName: "@metamask/example-snap";
                readonly registry: "https://registry.npmjs.org";
                readonly iconPath: "images/icon.svg";
            };
        };
    };
    initialPermissions: {
        'endowment:rpc': {
            snaps: boolean;
            dapps: boolean;
        };
        snap_getBip44Entropy: {
            coinType: number;
        }[];
        snap_dialog: {};
    };
    manifestVersion: "0.1";
};
export declare const MOCK_MANIFEST_FILE: VirtualFile<{
    description: string;
    version: SemVerVersion;
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
