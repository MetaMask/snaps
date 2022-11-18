import { assertStruct, Json } from '@metamask/utils';
import {
  gt as gtSemver,
  maxSatisfying as maxSatisfyingSemver,
  satisfies as satisfiesSemver,
  valid as validSemVerVersion,
  validRange as validSemVerRange,
} from 'semver';
import { is, refine, string, Struct, validate } from 'superstruct';

import { Opaque } from './types';

export const DEFAULT_REQUESTED_SNAP_VERSION = '*' as SemVerRange;

/**
 * {@link https://codemix.com/opaque-types-in-javascript/ Opaque} type for SemVer ranges.
 *
 * @example Use {@link assertIsSemVerRange} and {@link isValidSemVerRange} to cast to proper type.
 * ```typescript
 * const unsafeRange: string = dataFromUser();
 * assertIsSemVerRange(unsafeRange);
 * unsafeRange
 * // ^? SemVerRange
 * ```
 * @example If you know what you're doing and want to side-step type safety, casting from a string works correctly.
 * ```typescript
 * const unsafeRange: string = dataFromUser();
 * unsafeRange as SemVerRange;
 * // ^? SemVerRange
 * ```
 * @see {@link assertIsSemVerRange}
 * @see {@link isValidSemVerRange}
 */
export type SemVerRange = Opaque<string, typeof semVerRange>;
declare const semVerRange: unique symbol;

/**
 * {@link https://codemix.com/opaque-types-in-javascript/ Opaque} type for singular SemVer version.
 *
 * @example Use {@link assertIsSemVerVersion} and {@link isValidSemVerVersion} to cast to proper type.
 * ```typescript
 * const unsafeVersion: string = dataFromUser();
 * assertIsSemVerVersion(unsafeRange);
 * unsafeVersion
 * // ^? SemVerVersion
 * ```
 * @example If you know what you're doing and want to side-step type safety, casting from a string works correctly.
 * ```typescript
 * const unsafeVersion: string = dataFromUser();
 * unsafeRange as SemVerVersion;
 * // ^? SemVerVersion
 * ```
 * @see {@link assertIsSemVerVersion}
 * @see {@link isValidSemVerVersion}
 */
export type SemVerVersion = Opaque<string, typeof semVerVersion>;
declare const semVerVersion: unique symbol;

/**
 * A struct for validating a version string.
 */
export const VersionStruct = refine<SemVerVersion, null>(
  string() as unknown as Struct<SemVerVersion, null>,
  'Version',
  (value) => {
    if (validSemVerVersion(value) === null) {
      return `Expected SemVer version, got "${value}"`;
    }
    return true;
  },
);

export const VersionRangeStruct = refine<SemVerRange, null>(
  string() as unknown as Struct<SemVerRange, null>,
  'Version range',
  (value) => {
    if (validSemVerRange(value) === null) {
      return `Expected SemVer range, got "${value}"`;
    }
    return true;
  },
);

/**
 * Checks whether a SemVer version is valid.
 *
 * @param version - A potential version.
 * @returns `true` if the version is valid, and `false` otherwise.
 */
export function isValidSemVerVersion(
  version: unknown,
): version is SemVerVersion {
  return is(version, VersionStruct);
}

/**
 * Checks whether a SemVer version range is valid.
 *
 * @param versionRange - A potential version range.
 * @returns `true` if the version range is valid, and `false` otherwise.
 */
export function isValidSemVerRange(
  versionRange: unknown,
): versionRange is SemVerRange {
  return is(versionRange, VersionRangeStruct);
}

/**
 * Asserts that a value is a valid concrete SemVer version.
 *
 * @param version - A potential SemVer concrete version.
 */
export function assertIsSemVerVersion(
  version: unknown,
): asserts version is SemVerVersion {
  assertStruct(version, VersionStruct);
}

/**
 * Asserts that a value is a valid SemVer range.
 *
 * @param range - A potential SemVer range.
 */
export function assertIsSemVerRange(
  range: unknown,
): asserts range is SemVerRange {
  assertStruct(range, VersionRangeStruct);
}

/**
 * Checks whether a SemVer version is greater than another.
 *
 * @param version1 - The left-hand version.
 * @param version2 - The right-hand version.
 * @returns `version1 > version2`.
 */
export function gtVersion(
  version1: SemVerVersion,
  version2: SemVerVersion,
): boolean {
  return gtSemver(version1, version2);
}

/**
 * Returns whether a SemVer version satisfies a SemVer range.
 *
 * @param version - The SemVer version to check.
 * @param versionRange - The SemVer version range to check against.
 * @returns Whether the version satisfied the version range.
 */
export function satisfiesVersionRange(
  version: SemVerVersion,
  versionRange: SemVerRange,
): boolean {
  return satisfiesSemver(version, versionRange, {
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
): [undefined, SemVerRange] | [Error, undefined] {
  if (version === undefined || version === 'latest') {
    return [undefined, DEFAULT_REQUESTED_SNAP_VERSION];
  }
  return validate(version, VersionRangeStruct);
}
