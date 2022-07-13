import { Json } from '@metamask/utils';
import {
  gt as gtSemver,
  maxSatisfying as maxSatisfyingSemver,
  satisfies as satifiesSemver,
  validRange as validRangeSemver,
} from 'semver';

export const DEFAULT_REQUESTED_SNAP_VERSION = '*';

/**
 * Checks whether a SemVer version is greater than another.
 *
 * @param version1 - The left-hand version.
 * @param version2 - The right-hand version.
 * @returns `version1 > version2`.
 */
export function gtVersion(version1: string, version2: string): boolean {
  return gtSemver(version1, version2, { includePrerelease: true });
}

/**
 * Returns whether a SemVer version satisfies a SemVer range.
 *
 * @param version - The SemVer version to check.
 * @param versionRange - The SemVer version range to check against.
 * @returns Whether the version satisfied the version range.
 */
export function satifiesVersionRange(
  version: string,
  versionRange: string,
): boolean {
  return satifiesSemver(version, versionRange, {
    includePrerelease: true,
  });
}

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
  versions: string[],
  versionRange: string,
): string | null {
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
export function resolveVersion(version?: Json): Json {
  if (version === undefined || version === 'latest') {
    return DEFAULT_REQUESTED_SNAP_VERSION;
  }
  return version;
}

/**
 * Checks whether a SemVer version range is valid.
 *
 * @param versionRange - A potential version range.
 * @returns `true` if the version range is valid, and `false` otherwise.
 */
export function isValidSnapVersionRange(
  versionRange: unknown,
): versionRange is string {
  return Boolean(
    typeof versionRange === 'string' &&
      validRangeSemver(versionRange, { includePrerelease: true }) !== null,
  );
}
