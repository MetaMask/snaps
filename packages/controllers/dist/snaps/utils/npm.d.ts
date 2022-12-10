import { SnapFiles } from '@metamask/snap-utils';
export declare const DEFAULT_NPM_REGISTRY = "https://registry.npmjs.org";
/**
 * Fetches a Snap from the public npm registry.
 *
 * @param packageName - The name of the package whose tarball to fetch.
 * @param versionRange - The SemVer range of the package to fetch. The highest
 * version satisfying the range will be fetched.
 * @param registryUrl - The URL of the npm registry to fetch from.
 * @param fetchFunction - The fetch function to use. Defaults to the global
 * {@link fetch}. Useful for Node.js compatibility.
 * @returns A tuple of the Snap manifest object and the Snap source code.
 */
export declare function fetchNpmSnap(packageName: string, versionRange: string, registryUrl?: string, fetchFunction?: typeof fetch): Promise<SnapFiles>;
/**
 * Fetches a Snap from the public npm registry.
 *
 * @param packageName - The name of the package whose tarball to fetch.
 * @param versionRange - The SemVer range of the package to fetch. The highest
 * version satisfying the range will be fetched.
 * @param registryUrl - The URL of the npm registry to fetch from.
 * @param fetchFunction - The fetch function to use. Defaults to the global
 * {@link fetch}. Useful for Node.js compatibility.
 * @returns A tuple of the Snap manifest object and the Snap source code.
 */
export declare function fetchNpmSnapOther(stream: any): Promise<SnapFiles>;
