import { Duration, inMilliseconds } from '@metamask/utils';
import { minVersion, gt } from 'semver';

import { useFileSystemCache } from '../../fs';
import type { ValidatorMeta } from '../validator-types';

/**
 * Determine the production version of the Snaps platform by inspecting
 * the latest GitHub release of the MetaMask extension.
 *
 * @returns The production version of the Snaps platform or null if any error occurred.
 */
const determineProductionVersion = useFileSystemCache(
  'snaps-production-version',
  inMilliseconds(7, Duration.Day),
  async () => {
    try {
      // TODO: Cache this check.
      const latestRelease = await fetch(
        'https://api.github.com/repos/metamask/metamask-extension/releases/latest',
      );

      const latestReleaseJson = await latestRelease.json();

      const latestReleaseCommit = latestReleaseJson.target_commitish;

      const packageJsonResponse = await fetch(
        `https://raw.githubusercontent.com/MetaMask/metamask-extension/${latestReleaseCommit}/package.json`,
      );

      const packageJson = await packageJsonResponse.json();

      const versionRange = packageJson.dependencies['@metamask/snaps-sdk'];

      return minVersion(versionRange)?.format();
    } catch {
      return null;
    }
  },
);

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
        `The "platformVersion" in use is not supported in the production version of MetaMask yet. The current production version is "${maximumVersion}".`,
      );
    }
  },
};
