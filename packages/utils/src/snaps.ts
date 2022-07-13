import { createHash } from 'crypto';
import { SnapManifest } from './json-schemas';
import { SnapIdPrefixes, SnapValidationFailureReason } from './types';
import { ProgrammaticallyFixableSnapError } from './npm';

export const LOCALHOST_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);
export const SNAP_PREFIX = 'wallet_snap_';

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

/**
 * Calculates the Base64-encoded SHA-256 digest of a Snap source code string.
 *
 * @param sourceCode - The UTF-8 string source code of a Snap.
 * @returns The Base64-encoded SHA-256 digest of the source code.
 */
export function getSnapSourceShasum(sourceCode: string): string {
  return createHash('sha256').update(sourceCode, 'utf8').digest('base64');
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
