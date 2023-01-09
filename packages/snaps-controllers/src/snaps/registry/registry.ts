import { BlockReason } from '@metamask/snaps-registry';
import { SnapId } from '@metamask/snaps-utils';
import { SemVerVersion } from '@metamask/utils';

export type SnapsRegistryInfo = { version: SemVerVersion; checksum: string };
export type SnapsRegistryRequest = Record<SnapId, SnapsRegistryInfo>;

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
  ): Promise<Record<SnapId, SnapsRegistryResult>>;
};
