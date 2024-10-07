import { createRequire } from 'module';

import type { ValidatorMeta } from '../validator-types';

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
    // eslint-disable-next-line import/no-dynamic-require
    const actualVersion = require(packageJson).version;

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
