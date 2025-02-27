import packageJson from '@metamask/snaps-sdk/package.json';

/**
 * Get the current supported platform version.
 *
 * Note: This function assumes that the same SDK version is used across all
 * dependencies. If this is not the case, the version of the SDK that is
 * closest to the `snaps-utils` package will be returned.
 *
 * @returns The platform version.
 */
export function getPlatformVersion() {
  return packageJson.version;
}
