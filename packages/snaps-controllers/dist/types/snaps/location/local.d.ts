import type { SnapManifest, VirtualFile } from '@metamask/snaps-utils';
import type { HttpOptions } from './http';
import type { SnapLocation } from './location';
export declare class LocalLocation implements SnapLocation {
    #private;
    constructor(url: URL, opts?: HttpOptions);
    manifest(): Promise<VirtualFile<SnapManifest>>;
    fetch(path: string): Promise<VirtualFile>;
    get shouldAlwaysReload(): boolean;
}
