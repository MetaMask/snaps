import { BlockReason, SnapsRegistryDatabase } from '@metamask/snaps-registry';
import { SnapId, ValidatedSnapId } from '@metamask/snaps-utils';
import { SemVerVersion } from '@metamask/utils';

export type SnapsRegistryInfo = { version: SemVerVersion; checksum: string };
export type SnapsRegistryRequest = Record<SnapId, SnapsRegistryInfo>;
export type SnapsRegistryMetadata =
  SnapsRegistryDatabase['verifiedSnaps'][ValidatedSnapId]['metadata'];

// TODO: Decide on names for these
export enum SnapsRegistryStatus {
  Unverified,
  Blocked,
  Verified,
}

export type SnapsRegistryResult = {
  status: SnapsRegistryStatus;
  reason?: BlockReason;
};

export type SnapsRegistry = {
  get(
    snaps: SnapsRegistryRequest,
  ): Promise<Record<ValidatedSnapId, SnapsRegistryResult>>;

  /**
   * Get metadata for the given snap ID.
   *
   * @param snapId - The ID of the snap to get metadata for.
   * @returns The metadata for the given snap ID, or `null` if the snap is not
   * verified.
   */
  getMetadata(snapId: SnapId): Promise<SnapsRegistryMetadata | null>;
};
