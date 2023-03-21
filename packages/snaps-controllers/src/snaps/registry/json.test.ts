import { SnapsRegistryDatabase } from '@metamask/snaps-registry';
import {
  DEFAULT_SNAP_SHASUM,
  MOCK_SNAP_ID,
} from '@metamask/snaps-utils/test-utils';
import { SemVerRange, SemVerVersion } from '@metamask/utils';
import fetchMock from 'jest-fetch-mock';

import { getRestrictedSnapsRegistryControllerMessenger } from '../../test-utils';
import { JsonSnapsRegistry, JsonSnapsRegistryArgs } from './json';
import { SnapsRegistryStatus } from './registry';

const MOCK_PUBLIC_KEY =
  '0x034ca27b046507d1a9997bddc991b56d96b93d4adac3a96dfe01ce450bfb661455';

const getRegistry = (args?: Partial<JsonSnapsRegistryArgs>) => {
  const messenger = getRestrictedSnapsRegistryControllerMessenger();
  return {
    registry: new JsonSnapsRegistry({
      messenger,
      publicKey: MOCK_PUBLIC_KEY,
      ...args,
    }),
    messenger,
  };
};

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

const MOCK_SIGNATURE =
  '0x3045022100cc049732d4cc8b888162b8b998c9beefcc1de8c4489594c7c504d4aa031223af02206835834ba2b7bec45b2a9e1e72312d69445d6a0f5590a2408bb13931a14f6c8a';
const MOCK_SIGNATURE_FILE = {
  signature: MOCK_SIGNATURE,
  curve: 'secp256k1',
  format: 'DER',
};

describe('JsonSnapsRegistry', () => {
  fetchMock.enableMocks();

  afterEach(() => {
    fetchMock.resetMocks();
  });

  it('can get entries from the registry', async () => {
    fetchMock
      .mockResponseOnce(JSON.stringify(MOCK_DATABASE))
      .mockResponseOnce(JSON.stringify(MOCK_SIGNATURE_FILE));

    const { messenger } = getRegistry();
    const result = await messenger.call('SnapsRegistry:get', {
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
    fetchMock
      .mockResponseOnce(JSON.stringify({ verifiedSnaps: {}, blockedSnaps: [] }))
      .mockResponseOnce(JSON.stringify(MOCK_SIGNATURE_FILE));

    const { messenger } = getRegistry();
    const result = await messenger.call('SnapsRegistry:get', {
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
    fetchMock
      .mockResponseOnce(JSON.stringify(MOCK_DATABASE))
      .mockResponseOnce(JSON.stringify(MOCK_SIGNATURE_FILE));

    const { messenger } = getRegistry();
    const result = await messenger.call('SnapsRegistry:get', {
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
    fetchMock
      .mockResponseOnce(JSON.stringify(MOCK_DATABASE))
      .mockResponseOnce(JSON.stringify(MOCK_SIGNATURE_FILE));

    const { messenger } = getRegistry();
    const result = await messenger.call('SnapsRegistry:get', {
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
    fetchMock
      .mockResponseOnce(JSON.stringify(MOCK_DATABASE))
      .mockResponseOnce(JSON.stringify(MOCK_SIGNATURE_FILE));

    const { messenger } = getRegistry();
    const result = await messenger.call('SnapsRegistry:get', {
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
    fetchMock
      .mockResponseOnce(JSON.stringify(MOCK_DATABASE))
      .mockResponseOnce(JSON.stringify(MOCK_SIGNATURE_FILE));

    const { messenger } = getRegistry();
    const result = await messenger.call('SnapsRegistry:get', {
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

  it('refetches the database on allowlist miss if configured', async () => {
    fetchMock
      .mockResponseOnce(JSON.stringify(MOCK_DATABASE))
      .mockResponseOnce(JSON.stringify(MOCK_SIGNATURE_FILE));

    const { messenger } = getRegistry({
      refetchOnAllowlistMiss: true,
      state: {
        lastUpdated: 0,
        database: { verifiedSnaps: {}, blockedSnaps: [] },
      },
    });
    const result = await messenger.call('SnapsRegistry:get', {
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

  it('returns unverified for unavailable database if failOnUnavailableRegistry is set to false', async () => {
    fetchMock.mockResponse('', { status: 404 });

    const { messenger } = getRegistry({
      failOnUnavailableRegistry: false,
    });

    const result = await messenger.call('SnapsRegistry:get', {
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

  it('does not verify the signature if no public key is provided', async () => {
    fetchMock.mockResponse(JSON.stringify(MOCK_DATABASE));

    const { messenger } = getRegistry({
      publicKey: undefined,
    });

    const result = await messenger.call('SnapsRegistry:get', {
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

  it('throws for unavailable database by default', async () => {
    fetchMock.mockResponse('', { status: 404 });

    const { messenger } = getRegistry();

    await expect(
      messenger.call('SnapsRegistry:get', {
        [MOCK_SNAP_ID]: {
          version: '1.0.0' as SemVerVersion,
          checksum: DEFAULT_SNAP_SHASUM,
        },
      }),
    ).rejects.toThrow('Snaps registry is unavailable, installation blocked.');
  });

  it('throws for unavailable signature', async () => {
    fetchMock
      .mockResponseOnce(JSON.stringify(MOCK_DATABASE))
      .mockResponseOnce('', {
        status: 404,
      });

    const { messenger } = getRegistry();

    await expect(
      messenger.call('SnapsRegistry:get', {
        [MOCK_SNAP_ID]: {
          version: '1.0.0' as SemVerVersion,
          checksum: DEFAULT_SNAP_SHASUM,
        },
      }),
    ).rejects.toThrow('Snaps registry is unavailable, installation blocked.');
  });

  describe('getMetadata', () => {
    it('returns the metadata for a verified snap', async () => {
      fetchMock
        .mockResponseOnce(JSON.stringify(MOCK_DATABASE))
        .mockResponseOnce(JSON.stringify(MOCK_SIGNATURE_FILE));

      const { messenger } = getRegistry();
      const result = await messenger.call(
        'SnapsRegistry:getMetadata',
        MOCK_SNAP_ID,
      );

      expect(result).toStrictEqual({
        name: 'Mock Snap',
      });
    });

    it('returns null for a non-verified snap', async () => {
      fetchMock
        .mockResponseOnce(JSON.stringify(MOCK_DATABASE))
        .mockResponseOnce(JSON.stringify(MOCK_SIGNATURE_FILE));

      const { messenger } = getRegistry();
      const result = await messenger.call('SnapsRegistry:getMetadata', 'foo');

      expect(result).toBeNull();
    });
  });
});
