import { assert } from '@metamask/utils';
import { prerelease } from 'semver';

import packageJson from '../package.json';

enum Tag {
  Next = 'next',
  Latest = 'latest',
}

/**
 * Get the release tag from the `package.json` version.
 *
 * - If the version is a prerelease, the tag is `next`.
 * - Otherwise, the tag is `latest`.
 *
 * @returns The release tag.
 */
export function main(): Tag {
  const { version } = packageJson;

  assert(version, '`package.json` must have a version.');

  // Otherwise, we're on a stable branch, which may or may not be a prerelease.
  const prereleaseTag = prerelease(version);
  if (prereleaseTag) {
    return Tag.Next;
  }

  return Tag.Latest;
}

// eslint-disable-next-line no-console
console.log(main());
