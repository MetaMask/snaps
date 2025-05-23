import { createRequire } from 'module';
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
 * Check if the platform version in manifest matches the version of the Snaps
 * SDK.
 */
export const platformVersion: ValidatorMeta = {
  severity: 'error',
  async semanticCheck(files, context) {
    const manifestPlatformVersion = files.manifest.result.platformVersion;

    // Create a require function in the context of the location of the manifest
    // file to avoid potentially loading the wrong version of the Snaps SDK.
    const require = createRequire(files.manifest.path);

    const packageJson = require.resolve('@metamask/snaps-sdk/package.json');
    // eslint-disable-next-line import-x/no-dynamic-require
    const actualVersion = require(packageJson).version;

    const maximumVersion = await determineProductionVersion();

    if (maximumVersion && gt(actualVersion, maximumVersion)) {
      context.report(
        `The "platformVersion" in use is not supported in the production version of MetaMask yet. The current production version is "${maximumVersion.format()}".`,
      );
    }

    if (!manifestPlatformVersion) {
      context.report(
        'The "platformVersion" field is missing from the manifest.',
        ({ manifest }) => {
          manifest.platformVersion = actualVersion;
          return { manifest };
        },
      );

      return;
    }

    if (manifestPlatformVersion !== actualVersion) {
      context.report(
        `The "platformVersion" field in the manifest must match the version of the Snaps SDK. Got "${manifestPlatformVersion}", expected "${actualVersion}".`,
        async ({ manifest }) => {
          manifest.platformVersion = actualVersion;
          return { manifest };
        },
      );
    }
  },
};
