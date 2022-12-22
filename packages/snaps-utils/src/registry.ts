import {
  object,
  string,
  record,
  optional,
  union,
  array,
  Infer,
} from 'superstruct';

import { ChecksumStruct } from './manifest';
import { SnapId } from './types';
import { SemVerVersion, VersionRangeStruct, VersionStruct } from './versions';

export type SnapRegistryInfo = { version: SemVerVersion; checksum: string };
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

const VerifiedSnapVersionStruct = object({
  checksum: ChecksumStruct,
});

const VerifiedSnapStruct = object({
  id: string(),
  versions: record(VersionStruct, VerifiedSnapVersionStruct),
});

const BlockReasonStruct = object({
  explanation: optional(string()),
  url: optional(string()),
});

const BlockedSnapStruct = union([
  object({
    id: string(),
    versionRange: VersionRangeStruct,
    reason: optional(BlockReasonStruct),
  }),
  object({ checksum: ChecksumStruct, reason: optional(BlockReasonStruct) }),
]);

export const JsonSnapRegistryDatabaseStruct = object({
  verifiedSnaps: record(string(), VerifiedSnapStruct),
  blockedSnaps: array(BlockedSnapStruct),
});

export type JsonSnapRegistryDatabase = Infer<
  typeof JsonSnapRegistryDatabaseStruct
>;
