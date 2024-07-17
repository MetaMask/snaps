import type { SnapManifest } from '@metamask/snaps-utils';
import { VirtualFile } from '@metamask/snaps-utils';
import type { SnapLocation } from './location';
export interface HttpOptions {
    /**
     * @default fetch
     */
    fetch?: typeof fetch;
    fetchOptions?: RequestInit;
}
export declare class HttpLocation implements SnapLocation {
    private readonly cache;
    private validatedManifest?;
    private readonly url;
    private readonly fetchFn;
    private readonly fetchOptions?;
    constructor(url: URL, opts?: HttpOptions);
    manifest(): Promise<VirtualFile<SnapManifest>>;
    fetch(path: string): Promise<VirtualFile>;
    get root(): URL;
    private toCanonical;
}
