import { minVersion, gt } from 'semver';

import type { ValidatorMeta } from '../validator-types';

/**
 * Determine the production version of the Snaps platform by inspecting
 * the latest GitHub release of the MetaMask extension.
 *
 * @returns The production version of the Snaps platform or null if any error occurred.
 */
async function determineProductionVersion() {
  try {
    // TODO: Cache this check.
    const latestRelease = await fetch(
      'https://api.github.com/repos/metamask/metamask-extension/releases/latest',
    ).then(async (response) => response.json());

    const latestReleaseCommit = latestRelease.target_commitish;

    const packageJson = await fetch(
      `https://raw.githubusercontent.com/MetaMask/metamask-extension/${latestReleaseCommit}/package.json`,
    ).then(async (response) => response.json());

    const versionRange = packageJson.dependencies['@metamask/snaps-sdk'];

    return minVersion(versionRange);
  } catch {
    return null;
  }
}

/**
 * Check if the platform version in manifest exceeds the version
 * used in production.
 */
export const productionPlatformVersion: ValidatorMeta = {
  severity: 'warning',
  async semanticCheck(files, context) {
    const manifestPlatformVersion = files.manifest.result.platformVersion;

    if (!manifestPlatformVersion) {
      return;
    }

    const maximumVersion = await determineProductionVersion();

    if (!maximumVersion) {
      return;
    }

    if (gt(manifestPlatformVersion, maximumVersion)) {
      context.report(
        `The "platformVersion" in use is not supported in the production version of MetaMask yet. The current production version is "${maximumVersion.format()}".`,
      );
    }
  },
};
