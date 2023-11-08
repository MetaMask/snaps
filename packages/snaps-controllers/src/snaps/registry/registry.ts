import type {
  BlockReason,
  SnapsRegistryDatabase,
} from '@metamask/snaps-registry';
import type { SnapId } from '@metamask/snaps-sdk';
import type { SemVerRange, SemVerVersion } from '@metamask/utils';

export type SnapsRegistryInfo = { version: SemVerVersion; checksum: string };
export type SnapsRegistryRequest = Record<SnapId, SnapsRegistryInfo>;
export type SnapsRegistryMetadata =
  SnapsRegistryDatabase['verifiedSnaps'][SnapId]['metadata'];

// TODO: Decide on names for these
export enum SnapsRegistryStatus {
  Unverified = 0,
  Blocked = 1,
  Verified = 2,
}

export type SnapsRegistryResult = {
  status: SnapsRegistryStatus;
  reason?: BlockReason;
};

export type SnapsRegistry = {
  get(
    snaps: SnapsRegistryRequest,
  ): Promise<Record<SnapId, SnapsRegistryResult>>;

  update(): Promise<void>;

  /**
   * Find an allowlisted version within a specified version range.
   *
   * @param snapId - The ID of the snap we are trying to resolve a version for.
   * @param versionRange - The version range.
   * @param refetch - An optional flag used to determine if we are refetching the registry.
   * @returns An allowlisted version within the specified version range.
   * @throws If an allowlisted version does not exist within the version range.
   */
  resolveVersion(
    snapId: SnapId,
    versionRange: SemVerRange,
  ): Promise<SemVerRange>;

  /**
   * Get metadata for the given snap ID.
   *
   * @param snapId - The ID of the snap to get metadata for.
   * @returns The metadata for the given snap ID, or `null` if the snap is not
   * verified.
   */
  getMetadata(snapId: SnapId): Promise<SnapsRegistryMetadata | null>;
};
