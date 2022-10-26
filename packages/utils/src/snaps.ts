import { Json } from '@metamask/utils';
import { sha256 } from '@noble/hashes/sha256';
import { base64 } from '@scure/base';
import { SerializedEthereumRpcError } from 'eth-rpc-errors/dist/classes';
import {
  SnapId,
  SnapIdPrefixes,
  SnapValidationFailureReason,
  SnapManifest,
} from './types';

export const LOCALHOST_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);
export const SNAP_PREFIX = 'wallet_snap_';

export const SNAP_PREFIX_REGEX = new RegExp(`^${SNAP_PREFIX}`, 'u');

// This RegEx matches valid npm package names (with some exceptions) and space-
// separated alphanumerical words, optionally with dashes and underscores.
// The RegEx consists of two parts. The first part matches space-separated
// words. It is based on the following Stackoverflow answer:
// https://stackoverflow.com/a/34974982
// The second part, after the pipe operator, is the same RegEx used for the
// `name` field of the official package.json JSON Schema, except that we allow
// mixed-case letters. It was originally copied from:
// https://github.com/SchemaStore/schemastore/blob/81a16897c1dabfd98c72242a5fd62eb080ff76d8/src/schemas/json/package.json#L132-L138
export const PROPOSED_NAME_REGEX =
  /^(?:[A-Za-z0-9-_]+( [A-Za-z0-9-_]+)*)|(?:(?:@[A-Za-z0-9-*~][A-Za-z0-9-*._~]*\/)?[A-Za-z0-9-~][A-Za-z0-9-._~]*)$/u;

export type RequestedSnapPermissions = {
  [permission: string]: Record<string, Json>;
};

export type BlockedSnapInfo = { infoUrl?: string; reason?: string };

export enum SnapStatus {
  Installing = 'installing',
  Updating = 'updating',
  Running = 'running',
  Stopped = 'stopped',
  Crashed = 'crashed',
}

export enum SnapStatusEvents {
  Start = 'START',
  Stop = 'STOP',
  Crash = 'CRASH',
  Update = 'UPDATE',
}

export type StatusContext = { snapId: string };
export type StatusEvents = { type: SnapStatusEvents };
export type StatusStates = {
  value: SnapStatus;
  context: StatusContext;
};
export type Status = StatusStates['value'];

export type VersionHistory = {
  origin: string;
  version: string;
  // Unix timestamp
  date: number;
};

export type PersistedSnap = Snap & {
  /**
   * The source code of the Snap.
   */
  sourceCode: string;
};

/**
 * A Snap as it exists in {@link SnapController} state.
 */
export type Snap = {
  /**
   * Whether the Snap is enabled, which determines if it can be started.
   */
  enabled: boolean;

  /**
   * The ID of the Snap.
   */
  id: SnapId;

  /**
   * The initial permissions of the Snap, which will be requested when it is
   * installed.
   */
  initialPermissions: RequestedSnapPermissions;

  /**
   * The Snap's manifest file.
   */
  manifest: SnapManifest;

  /**
   * Whether the Snap is blocked.
   */
  blocked: boolean;

  /**
   * Information detailing why the snap is blocked.
   */
  blockInformation?: BlockedSnapInfo;

  /**
   * The name of the permission used to invoke the Snap.
   */
  permissionName: string;

  /**
   * The current status of the Snap, e.g. whether it's running or stopped.
   */
  status: Status;

  /**
   * The version of the Snap.
   */
  version: string;

  /**
   * The version history of the Snap.
   * Can be used to derive when the Snap was installed, when it was updated to a certain version and who requested the change.
   */
  versionHistory: VersionHistory[];
};

export type TruncatedSnapFields =
  | 'id'
  | 'initialPermissions'
  | 'permissionName'
  | 'version'
  | 'enabled'
  | 'blocked';

/**
 * A {@link Snap} object with the fields that are relevant to an external
 * caller.
 */
export type TruncatedSnap = Pick<Snap, TruncatedSnapFields>;

export type ProcessSnapResult =
  | TruncatedSnap
  | { error: SerializedEthereumRpcError };

export type InstallSnapsResult = Record<SnapId, ProcessSnapResult>;

/**
 * An error indicating that a Snap validation failure is programmatically
 * fixable during development.
 */
export class ProgrammaticallyFixableSnapError extends Error {
  reason: SnapValidationFailureReason;

  constructor(message: string, reason: SnapValidationFailureReason) {
    super(message);
    this.reason = reason;
  }
}

/**
 * Calculates the Base64-encoded SHA-256 digest of a Snap source code string.
 *
 * @param sourceCode - The UTF-8 string source code of a Snap.
 * @returns The Base64-encoded SHA-256 digest of the source code.
 */
export function getSnapSourceShasum(sourceCode: string): string {
  return base64.encode(sha256(sourceCode));
}

export type ValidatedSnapId = `local:${string}` | `npm:${string}`;

/**
 * Checks whether the `source.shasum` property of a Snap manifest matches the
 * shasum of a snap source code string.
 *
 * @param manifest - The manifest whose shasum to validate.
 * @param sourceCode - The source code of the snap.
 * @param errorMessage - The error message to throw if validation fails.
 */
export function validateSnapShasum(
  manifest: SnapManifest,
  sourceCode: string,
  errorMessage = 'Invalid Snap manifest: manifest shasum does not match computed shasum.',
): void {
  if (manifest.source.shasum !== getSnapSourceShasum(sourceCode)) {
    throw new ProgrammaticallyFixableSnapError(
      errorMessage,
      SnapValidationFailureReason.ShasumMismatch,
    );
  }
}

/**
 * Extracts the snap prefix from a snap ID.
 *
 * @param snapId - The snap ID to extract the prefix from.
 * @returns The snap prefix from a snap id, e.g. `npm:`.
 */
export function getSnapPrefix(snapId: string): SnapIdPrefixes {
  const prefix = Object.values(SnapIdPrefixes).find((p) =>
    snapId.startsWith(p),
  );
  if (prefix !== undefined) {
    return prefix;
  }
  throw new Error(`Invalid or no prefix found for "${snapId}"`);
}

/**
 * Computes the permission name of a snap from its snap ID.
 *
 * @param snapId - The snap ID.
 * @returns The permission name corresponding to the given snap ID.
 */
export function getSnapPermissionName(snapId: string): string {
  return SNAP_PREFIX + snapId;
}

/**
 * Asserts the provided object is a snapId with a supported prefix.
 *
 * @param snapId - The object to validate.
 * @throws {@link Error}. If the validation fails.
 */
export function validateSnapId(
  snapId: unknown,
): asserts snapId is ValidatedSnapId {
  if (!snapId || typeof snapId !== 'string') {
    throw new Error(`Invalid snap id. Not a string. Received "${snapId}"`);
  }

  for (const prefix of Object.values(SnapIdPrefixes)) {
    if (snapId.startsWith(prefix) && snapId.replace(prefix, '').length > 0) {
      return;
    }
  }

  throw new Error(`Invalid snap id. Unknown prefix. Received: "${snapId}"`);
}

/**
 * Typeguard to ensure a chainId follows the CAIP-2 standard.
 *
 * @param chainId - The chainId being tested.
 * @returns `true` if the value is a valid CAIP chain id, and `false` otherwise.
 */
export function isCaipChainId(chainId: unknown): chainId is string {
  return (
    typeof chainId === 'string' &&
    /^(?<namespace>[-a-z0-9]{3,8}):(?<reference>[-a-zA-Z0-9]{1,32})$/u.test(
      chainId,
    )
  );
}
