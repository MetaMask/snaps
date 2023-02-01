import { SnapsRegistryDatabase } from '@metamask/snaps-registry';
import {
  DEFAULT_SNAP_SHASUM,
  MOCK_SNAP_ID,
} from '@metamask/snaps-utils/test-utils';
import { SemVerRange, SemVerVersion } from '@metamask/utils';
import fetchMock from 'jest-fetch-mock';

import { JsonSnapsRegistry } from './json';
import { SnapsRegistryStatus } from './registry';

const MOCK_DATABASE: SnapsRegistryDatabase = {
  verifiedSnaps: {
    [MOCK_SNAP_ID]: {
      id: MOCK_SNAP_ID,
      metadata: {
        name: 'Mock Snap',
      },
      versions: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        ['1.0.0' as SemVerVersion]: {
          checksum: DEFAULT_SNAP_SHASUM,
        },
      },
    },
  },
  blockedSnaps: [
    {
      checksum: 'foo',
      reason: { explanation: 'malicious' },
    },
    {
      id: 'npm:@consensys/starknet-snap',
      versionRange: '<0.1.11' as SemVerRange,
      reason: { explanation: 'vuln' },
    },
  ],
};

describe('JsonSnapsRegistry', () => {
  fetchMock.enableMocks();

  it('can get entries from the registry', async () => {
    fetchMock.mockResponse(JSON.stringify(MOCK_DATABASE));
    const registry = new JsonSnapsRegistry();
    const result = await registry.get({
      [MOCK_SNAP_ID]: {
        version: '1.0.0' as SemVerVersion,
        checksum: DEFAULT_SNAP_SHASUM,
      },
    });

    expect(result).toStrictEqual({
      [MOCK_SNAP_ID]: {
        status: SnapsRegistryStatus.Verified,
      },
    });
  });

  it('returns unverified for non existing snaps', async () => {
    // Empty database
    fetchMock.mockResponse(
      JSON.stringify({ verifiedSnaps: {}, blockedSnaps: [] }),
    );
    const registry = new JsonSnapsRegistry();
    const result = await registry.get({
      [MOCK_SNAP_ID]: {
        version: '1.0.0' as SemVerVersion,
        checksum: DEFAULT_SNAP_SHASUM,
      },
    });

    expect(result).toStrictEqual({
      [MOCK_SNAP_ID]: {
        status: SnapsRegistryStatus.Unverified,
      },
    });
  });

  it('returns unverified for non existing versions', async () => {
    fetchMock.mockResponse(JSON.stringify(MOCK_DATABASE));
    const registry = new JsonSnapsRegistry();
    const result = await registry.get({
      [MOCK_SNAP_ID]: {
        version: '1.0.1' as SemVerVersion,
        checksum: DEFAULT_SNAP_SHASUM,
      },
    });

    expect(result).toStrictEqual({
      [MOCK_SNAP_ID]: {
        status: SnapsRegistryStatus.Unverified,
      },
    });
  });

  it('returns unverified if existing snap doesnt match checksum', async () => {
    fetchMock.mockResponse(JSON.stringify(MOCK_DATABASE));
    const registry = new JsonSnapsRegistry();
    const result = await registry.get({
      [MOCK_SNAP_ID]: {
        version: '1.0.0' as SemVerVersion,
        checksum: 'bar',
      },
    });

    expect(result).toStrictEqual({
      [MOCK_SNAP_ID]: {
        status: SnapsRegistryStatus.Unverified,
      },
    });
  });

  it('returns blocked if snap checksum is on blocklist', async () => {
    fetchMock.mockResponse(JSON.stringify(MOCK_DATABASE));
    const registry = new JsonSnapsRegistry();
    const result = await registry.get({
      [MOCK_SNAP_ID]: {
        version: '1.0.0' as SemVerVersion,
        checksum: 'foo',
      },
    });

    expect(result).toStrictEqual({
      [MOCK_SNAP_ID]: {
        status: SnapsRegistryStatus.Blocked,
        reason: { explanation: 'malicious' },
      },
    });
  });

  it('returns blocked if snap version range is on blocklist', async () => {
    fetchMock.mockResponse(JSON.stringify(MOCK_DATABASE));
    const registry = new JsonSnapsRegistry();
    const result = await registry.get({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'npm:@consensys/starknet-snap': {
        version: '0.1.10' as SemVerVersion,
        checksum: DEFAULT_SNAP_SHASUM,
      },
    });

    expect(result).toStrictEqual({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'npm:@consensys/starknet-snap': {
        status: SnapsRegistryStatus.Blocked,
        reason: { explanation: 'vuln' },
      },
    });
  });

  it('returns unverified for unavailable database if failOnUnavailableRegistry is set to false', async () => {
    fetchMock.mockResponse('', { status: 404 });
    const registry = new JsonSnapsRegistry({
      failOnUnavailableRegistry: false,
    });
    const result = await registry.get({
      [MOCK_SNAP_ID]: {
        version: '1.0.0' as SemVerVersion,
        checksum: DEFAULT_SNAP_SHASUM,
      },
    });

    expect(result).toStrictEqual({
      [MOCK_SNAP_ID]: {
        status: SnapsRegistryStatus.Unverified,
      },
    });
  });

  it('throws for unavailable database by default', async () => {
    fetchMock.mockResponse('', { status: 404 });
    const registry = new JsonSnapsRegistry();

    await expect(
      registry.get({
        [MOCK_SNAP_ID]: {
          version: '1.0.0' as SemVerVersion,
          checksum: DEFAULT_SNAP_SHASUM,
        },
      }),
    ).rejects.toThrow('Snaps registry is unavailable, installation blocked.');
  });

  describe('getMetadata', () => {
    it('returns the metadata for a verified snap', async () => {
      fetchMock.mockResponse(JSON.stringify(MOCK_DATABASE));

      const registry = new JsonSnapsRegistry();
      const result = await registry.getMetadata(MOCK_SNAP_ID);

      expect(result).toStrictEqual({
        name: 'Mock Snap',
      });
    });

    it('returns null for a non-verified snap', async () => {
      fetchMock.mockResponse(JSON.stringify(MOCK_DATABASE));

      const registry = new JsonSnapsRegistry();
      const result = await registry.getMetadata('foo');

      expect(result).toBeNull();
    });
  });
});
