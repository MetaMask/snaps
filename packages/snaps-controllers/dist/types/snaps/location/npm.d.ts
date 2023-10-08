import type { SnapManifest } from '@metamask/snaps-utils';
import { VirtualFile } from '@metamask/snaps-utils';
import type { SemVerRange } from '@metamask/utils';
import type { DetectSnapLocationOptions, SnapLocation } from './location';
export declare const DEFAULT_NPM_REGISTRY = "https://registry.npmjs.org";
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
export declare class NpmLocation implements SnapLocation {
    #private;
    private readonly meta;
    private validatedManifest?;
    private files?;
    constructor(url: URL, opts?: DetectSnapLocationOptions);
    manifest(): Promise<VirtualFile<SnapManifest>>;
    fetch(path: string): Promise<VirtualFile>;
    get packageName(): string;
    get version(): string;
    get registry(): URL;
    get versionRange(): SemVerRange;
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
export declare function fetchNpmMetadata(packageName: string, registryUrl: URL | string, fetchFunction: typeof fetch): Promise<PartialNpmMetadata>;
