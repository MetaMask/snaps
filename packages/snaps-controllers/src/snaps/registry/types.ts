import type {
  BlockReason,
  SnapsRegistryDatabase,
} from '@metamask/snaps-registry';
import type { SnapId } from '@metamask/snaps-sdk';
import type { SemVerVersion } from '@metamask/utils';

export type SnapRegistryInfo = { version: SemVerVersion; checksum: string };
export type SnapRegistryRequest = Record<SnapId, SnapRegistryInfo>;
export type SnapRegistryMetadata =
  SnapsRegistryDatabase['verifiedSnaps'][SnapId]['metadata'];

export enum SnapRegistryStatus {
  Unverified = 0,
  Blocked = 1,
  Verified = 2,
  Unavailable = 3,
}

export type SnapRegistryResult = {
  status: SnapRegistryStatus;
  reason?: BlockReason;
};
