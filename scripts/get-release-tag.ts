import { assert } from '@metamask/utils';
import { prerelease } from 'semver';

import packageJson from '../package.json';

enum Tag {
  Flask = 'flask',
  Next = 'next',
  Latest = 'latest',
}

/**
 * Get the release tag from the current branch name and `package.json` version.
 *
 * - If the branch name is `main`, the tag is `flask`.
 * - Otherwise, if the version is a prerelease, the tag is `next`.
 * - Otherwise, the tag is `latest`.
 *
 * @returns The release tag.
 */
export function main(): Tag {
  const branchName = process.env.GITHUB_REF_NAME;
  const { version } = packageJson;

  assert(branchName, 'GITHUB_REF_NAME must be set.');
  assert(version, '`package.json` must have a version.');

  // Currently, Flask releases are deployed from the `main` branch.
  if (branchName === 'main') {
    return Tag.Flask;
  }

  // Otherwise, we're on a stable branch, which may or may not be a prerelease.
  const prereleaseTag = prerelease(version);
  if (prereleaseTag) {
    return Tag.Next;
  }

  return Tag.Latest;
}

// eslint-disable-next-line no-console
console.log(main());
