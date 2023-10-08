import type { BlockReason, SnapsRegistryDatabase } from '@metamask/snaps-registry';
import type { SnapId, ValidatedSnapId } from '@metamask/snaps-utils';
import type { SemVerVersion } from '@metamask/utils';
export declare type SnapsRegistryInfo = {
    version: SemVerVersion;
    checksum: string;
};
export declare type SnapsRegistryRequest = Record<SnapId, SnapsRegistryInfo>;
export declare type SnapsRegistryMetadata = SnapsRegistryDatabase['verifiedSnaps'][ValidatedSnapId]['metadata'];
export declare enum SnapsRegistryStatus {
    Unverified = 0,
    Blocked = 1,
    Verified = 2
}
export declare type SnapsRegistryResult = {
    status: SnapsRegistryStatus;
    reason?: BlockReason;
};
export declare type SnapsRegistry = {
    get(snaps: SnapsRegistryRequest): Promise<Record<ValidatedSnapId, SnapsRegistryResult>>;
    update(): Promise<void>;
    /**
     * Get metadata for the given snap ID.
     *
     * @param snapId - The ID of the snap to get metadata for.
     * @returns The metadata for the given snap ID, or `null` if the snap is not
     * verified.
     */
    getMetadata(snapId: SnapId): Promise<SnapsRegistryMetadata | null>;
};
