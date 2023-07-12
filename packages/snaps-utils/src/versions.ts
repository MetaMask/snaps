import type { Json, SemVerVersion, SemVerRange } from '@metamask/utils';
import { VersionRangeStruct } from '@metamask/utils';
import { maxSatisfying as maxSatisfyingSemver } from 'semver';
import { validate } from 'superstruct';

export const DEFAULT_REQUESTED_SNAP_VERSION = '*' as SemVerRange;

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
export function getTargetVersion(
  versions: SemVerVersion[],
  versionRange: SemVerRange,
): SemVerVersion | null {
  const maxSatisfyingNonPreRelease = maxSatisfyingSemver(
    versions,
    versionRange,
  );

  // By default don't use pre-release versions
  if (maxSatisfyingNonPreRelease) {
    return maxSatisfyingNonPreRelease;
  }

  // If no satisfying release version is found by default, try pre-release versions
  return maxSatisfyingSemver(versions, versionRange, {
    includePrerelease: true,
  });
}

/**
 * Parse a version received by some subject attempting to access a snap.
 *
 * @param version - The received version value.
 * @returns `*` if the version is `undefined` or `latest", otherwise returns
 * the specified version.
 */
export function resolveVersionRange(
  version?: Json,
): [error: undefined, range: SemVerRange] | [error: Error, range: undefined] {
  if (version === undefined || version === 'latest') {
    return [undefined, DEFAULT_REQUESTED_SNAP_VERSION];
  }
  return validate(version, VersionRangeStruct);
}
