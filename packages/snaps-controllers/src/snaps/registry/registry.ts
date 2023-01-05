import { BlockReason } from '@metamask/snaps-registry';
import { SnapId } from '@metamask/snaps-utils';
import { SemVerVersion } from '@metamask/utils';

export type SnapRegistryInfo = { version: SemVerVersion; checksum: string };
export type SnapRegistryRequest = Record<SnapId, SnapRegistryInfo>;

// TODO: Decide on names for these
export enum SnapRegistryStatus {
  Unverified,
  Blocked,
  Verified,
}

export type SnapRegistryResult = {
  status: SnapRegistryStatus;
  reason?: BlockReason;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface SnapRegistry {
  get(snaps: SnapRegistryRequest): Promise<Record<SnapId, SnapRegistryResult>>;
}
