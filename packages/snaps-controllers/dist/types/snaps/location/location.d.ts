import type { SnapManifest, VirtualFile } from '@metamask/snaps-utils';
import type { NpmOptions } from './npm';
declare module '@metamask/snaps-utils' {
    interface DataMap {
        /**
         * Fully qualified, canonical path for the file in {@link https://github.com/MetaMask/SIPs/blob/main/SIPS/sip-8.md SIP-8 } URI format.
         */
        canonicalPath: string;
    }
}
export interface SnapLocation {
    /**
     * All files are relative to the manifest, except the manifest itself.
     */
    manifest(): Promise<VirtualFile<SnapManifest>>;
    fetch(path: string): Promise<VirtualFile>;
    readonly shouldAlwaysReload?: boolean;
}
export declare type DetectSnapLocationOptions = NpmOptions & {
    /**
     * The function used to fetch data.
     *
     * @default globalThis.fetch
     */
    fetch?: typeof fetch;
    /**
     * @default false
     */
    allowHttp?: boolean;
    /**
     * @default false
     */
    allowLocal?: boolean;
};
/**
 * Auto-magically detects which SnapLocation object to create based on the provided {@link location}.
 *
 * @param location - A {@link https://github.com/MetaMask/SIPs/blob/main/SIPS/sip-8.md SIP-8} uri.
 * @param opts - NPM options and feature flags.
 * @returns SnapLocation based on url.
 */
export declare function detectSnapLocation(location: string | URL, opts?: DetectSnapLocationOptions): SnapLocation;
