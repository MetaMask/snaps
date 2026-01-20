import { createRequire } from 'module';

import type { ValidatorMeta } from '../validator-types';

/**
 * Check if the platform version in manifest matches the version of the Snaps
 * SDK.
 */
export const platformVersion: ValidatorMeta = {
  severity: 'error',
  async semanticCheck(files, context) {
    const manifestPlatformVersion =
      files.manifest.mergedManifest.platformVersion;

    // Create a require function in the context of the location of the manifest
    // file to avoid potentially loading the wrong version of the Snaps SDK.
    const require = createRequire(files.manifest.mainManifest.path);

    const packageJson = require.resolve('@metamask/snaps-sdk/package.json');
    // eslint-disable-next-line import-x/no-dynamic-require
    const actualVersion = require(packageJson).version;

    if (!manifestPlatformVersion) {
      context.report(
        'platform-version-missing',
        'The "platformVersion" field is missing from the manifest.',
        ({ manifest }) => {
          manifest.mainManifest.result.platformVersion = actualVersion;
          return { manifest };
        },
      );

      return;
    }

    if (manifestPlatformVersion !== actualVersion) {
      context.report(
        'platform-version-mismatch',
        `The "platformVersion" field in the manifest must match the version of the Snaps SDK. Got "${manifestPlatformVersion}", expected "${actualVersion}".`,
        async ({ manifest }) => {
          manifest.mainManifest.result.platformVersion = actualVersion;
          return { manifest };
        },
      );
    }
  },
};
