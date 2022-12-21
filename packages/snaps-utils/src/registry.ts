import { SnapId } from './types';
import { SemVerVersion } from './versions';

export type SnapRegistryInfo = { version: SemVerVersion; shasum: string };
export type SnapRegistryRequest = Record<SnapId, SnapRegistryInfo>;

// TODO: Decide on names for these
export enum SnapRegistryStatus {
  Unverified,
  Blocked,
  Verified,
}

export type SnapRegistryBlockReason = {
  explanation?: string;
  url?: string;
};

export type SnapRegistryResult = {
  status: SnapRegistryStatus;
  reason?: SnapRegistryBlockReason;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface SnapRegistry {
  get(snaps: SnapRegistryRequest): Promise<Record<SnapId, SnapRegistryResult>>;
}
