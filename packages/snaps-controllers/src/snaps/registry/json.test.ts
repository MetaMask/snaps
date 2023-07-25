import type { SnapsRegistryDatabase } from '@metamask/snaps-registry';
import {
  DEFAULT_SNAP_SHASUM,
  MOCK_SNAP_ID,
} from '@metamask/snaps-utils/test-utils';
import type { SemVerRange, SemVerVersion } from '@metamask/utils';
import fetchMock from 'jest-fetch-mock';

import { getRestrictedSnapsRegistryControllerMessenger } from '../../test-utils';
import type { JsonSnapsRegistryArgs } from './json';
import { JsonSnapsRegistry } from './json';
import { SnapsRegistryStatus } from './registry';

const MOCK_PUBLIC_KEY =
  '0x0351e33621fd89183c3db90db7db2a518a91ad0534d1345d031625d33e581e495a';

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
  '0x3044022067256cfed70fe93696246f58aa7ff252eba82fd3a6741d2551a58dcda017111402201cc11efbf5bc5f381b4bae4b83d84565ba478ad33308d72c23b47e8dda5b9983';
const MOCK_SIGNATURE_FILE = {
  signature: MOCK_SIGNATURE,
  curve: 'secp256k1',
  format: 'DER',
};

const MOCK_EMPTY_SIGNATURE =
  '0x304402202de0931fff0173f5c0e701cc8228f2b732da5fa719199b487d7c05e7a47b954702202ff96a4a4748af9cc3a9b6eb7065235f84a2680add6e3aee3ee761eb3084a8e1';
const MOCK_EMPTY_SIGNATURE_FILE = {
  signature: MOCK_EMPTY_SIGNATURE,
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
      .mockResponseOnce(JSON.stringify(MOCK_EMPTY_SIGNATURE_FILE));

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

  it('throws for invalid signature', async () => {
    fetchMock
      .mockResponseOnce(JSON.stringify(MOCK_DATABASE))
      .mockResponseOnce(JSON.stringify(MOCK_SIGNATURE_FILE));

    const { messenger } = getRegistry({
      publicKey:
        '0x034ca27b046507d1a9997bddc991b56d96b93d4adac3a96dfe01ce450bfb661455',
    });

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

  describe('update', () => {
    it('updates the database', async () => {
      fetchMock
        .mockResponseOnce(JSON.stringify(MOCK_DATABASE))
        .mockResponseOnce(JSON.stringify(MOCK_SIGNATURE_FILE));

      const { messenger } = getRegistry();
      await messenger.call('SnapsRegistry:update');

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('does not fetch if a second call is made under the threshold', async () => {
      fetchMock
        .mockResponseOnce(JSON.stringify(MOCK_DATABASE))
        .mockResponseOnce(JSON.stringify(MOCK_SIGNATURE_FILE));

      const { messenger } = getRegistry();
      await messenger.call('SnapsRegistry:update');
      await messenger.call('SnapsRegistry:update');

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });
});
