import type { SnapManifest } from '@metamask/snaps-utils';
import { VirtualFile } from '@metamask/snaps-utils';
import type { SemVerRange } from '@metamask/utils';
import type { DetectSnapLocationOptions, SnapLocation } from './location';
export declare const DEFAULT_NPM_REGISTRY: URL;
interface NpmMeta {
    registry: URL;
    packageName: string;
    requestedRange: SemVerRange;
    version?: string;
    fetch: typeof fetch;
    resolveVersion: (range: SemVerRange) => Promise<SemVerRange>;
}
export interface NpmOptions {
    /**
     * @default DEFAULT_REQUESTED_SNAP_VERSION
     */
    versionRange?: SemVerRange;
    /**
     * Whether to allow custom NPM registries outside of {@link DEFAULT_NPM_REGISTRY}.
     *
     * @default false
     */
    allowCustomRegistries?: boolean;
}
export declare abstract class BaseNpmLocation implements SnapLocation {
    #private;
    protected readonly meta: NpmMeta;
    constructor(url: URL, opts?: DetectSnapLocationOptions);
    manifest(): Promise<VirtualFile<SnapManifest>>;
    fetch(path: string): Promise<VirtualFile>;
    get packageName(): string;
    get version(): string;
    get registry(): URL;
    get versionRange(): SemVerRange;
    /**
     * Fetches and unpacks the tarball (`.tgz` file) from the specified URL.
     *
     * @param tarballUrl - The tarball URL to fetch and unpack.
     * @returns A the files for the package tarball.
     * @throws If fetching the tarball fails.
     */
    abstract fetchNpmTarball(tarballUrl: URL): Promise<Map<string, VirtualFile>>;
}
export declare const TARBALL_SIZE_SAFETY_LIMIT = 262144000;
export declare class NpmLocation extends BaseNpmLocation {
    /**
     * Fetches and unpacks the tarball (`.tgz` file) from the specified URL.
     *
     * @param tarballUrl - The tarball URL to fetch and unpack.
     * @returns A the files for the package tarball.
     * @throws If fetching the tarball fails.
     */
    fetchNpmTarball(tarballUrl: URL): Promise<Map<string, VirtualFile<unknown>>>;
}
export declare type PartialNpmMetadata = {
    versions: Record<string, {
        dist: {
            tarball: string;
        };
    }>;
};
/**
 * Fetches the NPM metadata of the specified package from
 * the public npm registry.
 *
 * @param packageName - The name of the package whose metadata to fetch.
 * @param registryUrl - The URL of the npm registry to fetch the metadata from.
 * @param fetchFunction - The fetch function to use. Defaults to the global
 * {@link fetch}. Useful for Node.js compatibility.
 * @returns The NPM metadata object.
 * @throws If fetching the metadata fails.
 */
export declare function fetchNpmMetadata(packageName: string, registryUrl: URL, fetchFunction: typeof fetch): Promise<PartialNpmMetadata>;
/**
 * Gets the canonical base path for an NPM snap.
 *
 * @param registryUrl - A registry URL.
 * @param packageName - A package name.
 * @returns The canonical base path.
 */
export declare function getNpmCanonicalBasePath(registryUrl: URL, packageName: string): string;
export {};
