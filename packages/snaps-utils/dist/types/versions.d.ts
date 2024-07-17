import type { Json, SemVerVersion, SemVerRange } from '@metamask/utils';
export declare const DEFAULT_REQUESTED_SNAP_VERSION: SemVerRange;
/**
 * Return the highest version in the list that satisfies the range, or `null` if
 * none of them do. For the satisfaction check, pre-release versions will only
 * be checked if no satisfactory non-prerelease version is found first.
 *
 * @param versions - The list of version to check.
 * @param versionRange - The SemVer version range to check against.
 * @returns The highest version in the list that satisfies the range,
 * or `null` if none of them do.
 */
export declare function getTargetVersion(versions: SemVerVersion[], versionRange: SemVerRange): SemVerVersion | null;
/**
 * Parse a version received by some subject attempting to access a snap.
 *
 * @param version - The received version value.
 * @returns `*` if the version is `undefined` or `latest", otherwise returns
 * the specified version.
 */
export declare function resolveVersionRange(version?: Json): [error: undefined, range: SemVerRange] | [error: Error, range: undefined];
