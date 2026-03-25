import type {
  BlockReason,
  SnapsRegistryDatabase,
} from '@metamask/snaps-registry';
import type { SnapId } from '@metamask/snaps-sdk';
import type { SemVerVersion } from '@metamask/utils';

export type SnapsRegistryInfo = { version: SemVerVersion; checksum: string };
export type SnapsRegistryRequest = Record<SnapId, SnapsRegistryInfo>;
export type SnapsRegistryMetadata =
  SnapsRegistryDatabase['verifiedSnaps'][SnapId]['metadata'];

export enum SnapsRegistryStatus {
  Unverified = 0,
  Blocked = 1,
  Verified = 2,
  Unavailable = 3,
}

export type SnapsRegistryResult = {
  status: SnapsRegistryStatus;
  reason?: BlockReason;
};
