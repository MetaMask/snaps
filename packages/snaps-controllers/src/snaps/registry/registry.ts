import { SemVerVersion, SnapId } from '@metamask/snaps-utils';

export type SnapRegistryInfo = { version: SemVerVersion; shasum: string };
export type SnapRegistryRequest = Record<SnapId, SnapRegistryInfo>;

// TODO: Decide on names for these
export enum SnapRegistryStatus {
  Unverified,
  Blocked,
  Verified,
}

export type SnapRegistryResult = {
  status: SnapRegistryStatus;
};

export interface SnapRegistry {
  get(snaps: SnapRegistryRequest): Promise<Record<SnapId, SnapRegistryResult>>;
}
