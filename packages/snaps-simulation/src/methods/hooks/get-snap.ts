import type { SnapId } from '@metamask/snaps-sdk';
import type { Snap } from '@metamask/snaps-utils';
import { SnapStatus } from '@metamask/snaps-utils';
import type { SemVerVersion } from '@metamask/utils';

/**
 * Get a method that gets a Snap by its ID.
 *
 * @param preinstalled - Whether the Snap is preinstalled. If `true`, the Snap
 * will be returned as a preinstalled Snap.
 * @returns A method that gets a Snap by its ID. It will always return a mock
 * Snap for simulation purposes.
 */
export function getGetSnapImplementation(preinstalled: boolean = true) {
  return (_snapId: string): Snap => {
    // This is a mock Snap for simulation purposes. Most of the fields are not
    // actually used, but returned for type-safety sake.
    return {
      id: 'npm:@metamask/snaps-simulation' as SnapId,
      version: '0.1.0' as SemVerVersion,
      enabled: true,
      blocked: false,
      status: SnapStatus.Running,
      versionHistory: [],
      initialPermissions: {},
      sourceCode: '',
      manifest: {
        version: '0.1.0' as SemVerVersion,
        proposedName: 'Test Snap',
        description: 'A test Snap for simulation purposes.',
        repository: {
          type: 'git',
          url: 'https://github.com/MetaMask/snaps.git',
        },
        source: {
          shasum: 'unused',
          location: {
            npm: {
              filePath: 'dist/index.js',
              packageName: '@metamask/snaps-simulation',
              registry: 'https://registry.npmjs.org',
            },
          },
        },
        initialPermissions: {},
        manifestVersion: '0.1',
      },
      preinstalled,
    };
  };
}
