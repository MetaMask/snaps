import type { Infer } from 'superstruct';
import type { SnapManifest } from './manifest';
import type { VirtualFile } from './virtual-file';
export declare const LOCALIZABLE_FIELDS: readonly ["description", "proposedName"];
export declare const LocalizationFileStruct: import("superstruct").Struct<{
    locale: string;
    messages: Record<string, {
        message: string;
        description?: string | undefined;
    }>;
}, {
    locale: import("superstruct").Struct<string, null>;
    messages: import("superstruct").Struct<Record<string, {
        message: string;
        description?: string | undefined;
    }>, null>;
}>;
export declare type LocalizationFile = Infer<typeof LocalizationFileStruct>;
/**
 * Validate a list of localization files.
 *
 * @param localizationFiles - The localization files to validate.
 * @returns The validated localization files.
 * @throws If any of the files are considered invalid.
 */
export declare function getValidatedLocalizationFiles(localizationFiles: VirtualFile[]): VirtualFile<LocalizationFile>[];
/**
 * Get the localization file for a given locale. If the locale is not found,
 * the English localization file will be returned.
 *
 * @param locale - The locale to use.
 * @param localizationFiles - The localization files to use.
 * @returns The localization file, or `undefined` if no localization file was
 * found.
 */
export declare function getLocalizationFile(locale: string, localizationFiles: LocalizationFile[]): {
    locale: string;
    messages: Record<string, {
        message: string;
        description?: string | undefined;
    }>;
} | undefined;
export declare const TRANSLATION_REGEX: RegExp;
/**
 * Translate a string using a localization file. This will replace all instances
 * of `{{key}}` with the localized version of `key`.
 *
 * @param value - The string to translate.
 * @param file - The localization file to use, or `undefined` if no localization
 * file was found.
 * @returns The translated string.
 * @throws If the string contains a key that is not present in the localization
 * file, or if no localization file was found.
 */
export declare function translate(value: string, file: LocalizationFile | undefined): string;
/**
 * Get the localized Snap manifest for a given locale. This will replace all
 * localized strings in the manifest with the localized version.
 *
 * @param snapManifest - The Snap manifest to localize.
 * @param locale - The locale to use.
 * @param localizationFiles - The localization files to use.
 * @returns The localized Snap manifest.
 */
export declare function getLocalizedSnapManifest(snapManifest: SnapManifest, locale: string, localizationFiles: LocalizationFile[]): {
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
};
/**
 * Validate the localization files for a Snap manifest.
 *
 * @param snapManifest - The Snap manifest to validate.
 * @param localizationFiles - The localization files to validate.
 * @throws If the manifest cannot be localized.
 */
export declare function validateSnapManifestLocalizations(snapManifest: SnapManifest, localizationFiles: LocalizationFile[]): void;
