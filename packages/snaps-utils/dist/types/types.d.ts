import type { Json } from '@metamask/utils';
import type { Infer, Struct } from 'superstruct';
import type { SnapCaveatType } from './caveats';
import type { SnapFunctionExports } from './handlers';
import { HandlerType } from './handlers';
import type { SnapManifest } from './manifest';
import type { VirtualFile } from './virtual-file';
export declare enum NpmSnapFileNames {
    PackageJson = "package.json",
    Manifest = "snap.manifest.json"
}
export declare const NameStruct: Struct<string, null>;
export declare const NpmSnapPackageJsonStruct: Struct<{
    name: string;
    version: import("@metamask/utils").SemVerVersion;
    repository?: {
        type: string;
        url: string;
    } | undefined;
    main?: string | undefined;
}, {
    version: Struct<import("@metamask/utils").SemVerVersion, null>;
    name: Struct<string, null>;
    main: Struct<string | undefined, null>;
    repository: Struct<{
        type: string;
        url: string;
    } | undefined, {
        type: Struct<string, null>;
        url: Struct<string, null>;
    }>;
}>;
export declare type NpmSnapPackageJson = Infer<typeof NpmSnapPackageJsonStruct> & Record<string, any>;
/**
 * Check if the given value is a valid {@link NpmSnapPackageJson} object.
 *
 * @param value - The value to check.
 * @returns Whether the value is a valid {@link NpmSnapPackageJson} object.
 */
export declare function isNpmSnapPackageJson(value: unknown): value is NpmSnapPackageJson;
/**
 * Asserts that the given value is a valid {@link NpmSnapPackageJson} object.
 *
 * @param value - The value to check.
 * @throws If the value is not a valid {@link NpmSnapPackageJson} object.
 */
export declare function assertIsNpmSnapPackageJson(value: unknown): asserts value is NpmSnapPackageJson;
/**
 * An object for storing parsed but unvalidated Snap file contents.
 */
export declare type UnvalidatedSnapFiles = {
    manifest?: VirtualFile<Json>;
    packageJson?: VirtualFile<Json>;
    sourceCode?: VirtualFile;
    svgIcon?: VirtualFile;
};
/**
 * An object for storing the contents of Snap files that have passed JSON
 * Schema validation, or are non-empty if they are strings.
 */
export declare type SnapFiles = {
    manifest: VirtualFile<SnapManifest>;
    packageJson: VirtualFile<NpmSnapPackageJson>;
    sourceCode: VirtualFile;
    svgIcon?: VirtualFile;
};
/**
 * The possible prefixes for snap ids.
 */
export declare enum SnapIdPrefixes {
    npm = "npm:",
    local = "local:"
}
export declare type SnapId = string;
/**
 * Snap validation failure reason codes that are programmatically fixable
 * if validation occurs during development.
 */
export declare enum SnapValidationFailureReason {
    NameMismatch = "\"name\" field mismatch",
    VersionMismatch = "\"version\" field mismatch",
    RepositoryMismatch = "\"repository\" field mismatch",
    ShasumMismatch = "\"shasum\" field mismatch"
}
export declare enum SNAP_STREAM_NAMES {
    JSON_RPC = "jsonRpc",
    COMMAND = "command"
}
export declare const SNAP_EXPORT_NAMES: HandlerType[];
export declare type SnapRpcHookArgs = {
    origin: string;
    handler: HandlerType;
    request: Record<string, unknown>;
};
export declare type SnapRpcHook = (options: SnapRpcHookArgs) => Promise<unknown>;
declare type ObjectParameters<Type extends Record<string, (...args: any[]) => unknown>> = Parameters<Type[keyof Type]>;
export declare type SnapExportsParameters = ObjectParameters<SnapFunctionExports>;
declare type UriOptions<Type extends string> = {
    protocol?: Struct<Type>;
    hash?: Struct<Type>;
    port?: Struct<Type>;
    hostname?: Struct<Type>;
    pathname?: Struct<Type>;
    search?: Struct<Type>;
};
export declare const uri: (opts?: UriOptions<any>) => Struct<string | URL, null>;
/**
 * Returns whether a given value is a valid URL.
 *
 * @param url - The value to check.
 * @param opts - Optional constraints for url checking.
 * @returns Whether `url` is valid URL or not.
 */
export declare function isValidUrl(url: unknown, opts?: UriOptions<any>): url is string | URL;
export declare const WALLET_SNAP_PERMISSION_KEY = "wallet_snap";
export declare type SnapsPermissionRequest = {
    [WALLET_SNAP_PERMISSION_KEY]: {
        caveats: [
            {
                type: SnapCaveatType.SnapIds;
                value: Record<string, Json>;
            }
        ];
    };
};
export {};
