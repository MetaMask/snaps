/* eslint-disable @typescript-eslint/naming-convention */
import type { SnapManifest } from '@metamask/snaps-utils';
import { VirtualFile } from '@metamask/snaps-utils';
import type { SemVerVersion } from '@metamask/utils';
import { stringToBytes } from '@metamask/utils';

export const MOCK_MANIFEST = {
  version: '1.0.0' as SemVerVersion,
  description: 'The test example snap!',
  proposedName: '@metamask/example-snap',
  repository: {
    type: 'git' as const,
    url: 'https://github.com/MetaMask/example-snap.git',
  },
  source: {
    shasum: 'jf7x/ZXB+/oM+VFX0HThGDXf8aubOgD/RO0edGbDDqc=',
    location: {
      npm: {
        filePath: 'dist/bundle.js',
        packageName: '@metamask/example-snap',
        registry: 'https://registry.npmjs.org',
        iconPath: 'images/icon.svg',
      } as const,
    },
  },
  initialPermissions: {
    'endowment:rpc': { snaps: false, dapps: true },
    snap_getBip44Entropy: [
      {
        coinType: 1,
      },
    ],
    snap_dialog: {},
  },
  manifestVersion: '0.1' as const,
};

export const MOCK_MANIFEST_FILE = new VirtualFile<SnapManifest>(
  stringToBytes(JSON.stringify(MOCK_MANIFEST)),
);
MOCK_MANIFEST_FILE.result = MOCK_MANIFEST;
MOCK_MANIFEST_FILE.path = 'snap.manifest.json';
MOCK_MANIFEST_FILE.data = {
  canonicalPath: `local:http://localhost:8080/${MOCK_MANIFEST_FILE.path}`,
};
