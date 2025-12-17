import { deriveStateFromMetadata } from '@metamask/base-controller';
import type { SnapsRegistryDatabase } from '@metamask/snaps-registry';
import {
  DEFAULT_SNAP_SHASUM,
  MOCK_SNAP_ID,
} from '@metamask/snaps-utils/test-utils';
import type { SemVerRange, SemVerVersion } from '@metamask/utils';
import fetchMock from 'jest-fetch-mock';

import type { JsonSnapsRegistryArgs } from './json';
import { JsonSnapsRegistry } from './json';
import { SnapsRegistryStatus } from './registry';
import { getRestrictedSnapsRegistryControllerMessenger } from '../../test-utils';

// Public key for the private key:
// `0x541c6759fd86c69eceb8d792d7174623db139d81a5b560aa026afcb2dd1bb21c`.
const MOCK_PUBLIC_KEY =
  '0x03a885324b8520fba54a173999629952cfa1f97930c20902ec389f9c32c6ffbc40';

const getRegistry = (args?: Partial<JsonSnapsRegistryArgs>) => {
  const messenger = getRestrictedSnapsRegistryControllerMessenger();
  return {
    registry: new JsonSnapsRegistry({
      messenger,
      publicKey: MOCK_PUBLIC_KEY,
      clientConfig: {
        type: 'extension',
        version: '13.9.0' as SemVerVersion,
      },
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

// To regenerate this signature:
// 1. Use the private key above, and paste it in `secp256k1-key` in
//    `snaps-registry`.
// 2. JSON.stringify the database above, and paste it in the `sign-registry`
//    script in `snaps-registry` (instead of `fs.readFile`).
//    - Pasting the JSON in the registry file directly will not work, as it
//      contains a trailing newline.
// 3. Run the `sign-registry` script.
// 4. Copy the signature from the `signature.json` file.
const MOCK_SIGNATURE =
  '0x3045022100fd130773d66931560f199e783c48cf7d8c28d73ea8366add5b64ebcf61f98eca02206f6c56070d5d5899a50fea68add84570d5171c6fae812d4c3a89d5ccdcf396b2';
const MOCK_SIGNATURE_FILE = {
  signature: MOCK_SIGNATURE,
  curve: 'secp256k1',
  format: 'DER',
};

// To regenerate this signature:
// 1. Follow the steps above, but use the empty database below:
//    `{"verifiedSnaps":{},"blockedSnaps":[]}`
const MOCK_EMPTY_SIGNATURE =
  '0x30450221009394dd1ab94c99079ce0e9f24170e4e4c40811e261013d3e6b80e4076cca7f9c0220201b6f5479a553fd50fc43fc50d18874583f29757b3f44cd088fae5aeb3595e2';
const MOCK_EMPTY_SIGNATURE_FILE = {
  signature: MOCK_EMPTY_SIGNATURE,
  curve: 'secp256k1',
  format: 'DER',
};

const MOCK_DATABASE_COMPATIBILITY = {
  verifiedSnaps: {
    [MOCK_SNAP_ID]: {
      id: MOCK_SNAP_ID,
      metadata: {
        name: 'Mock Snap',
      },
      versions: {
        ['1.0.0' as SemVerVersion]: {
          checksum: DEFAULT_SNAP_SHASUM,
          clientVersions: {
            extension: '>=13.9.0',
          },
        },
        ['1.1.0' as SemVerVersion]: {
          checksum: DEFAULT_SNAP_SHASUM,
          clientVersions: {
            extension: '>=15.0.0',
          },
        },
      },
    },
  },
  blockedSnaps: [],
};

/**
 * To regenerate the signature, repeat the instructions above but with MOCK_DATABASE_COMPATIBILITY
 */
const MOCK_COMPATIBILITY_SIGNATURE =
  '0x3045022100c0dd17483ac052b25a24c43a84de7b7b38194ac770cadb53a83ca950150631bd02204ed1f6b3359901199e2752d148079084cda13439150136055be5d4a3df205115';
const MOCK_COMPATIBILITY_SIGNATURE_FILE = {
  signature: MOCK_COMPATIBILITY_SIGNATURE,
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
      'npm:@consensys/starknet-snap': {
        version: '0.1.10' as SemVerVersion,
        checksum: DEFAULT_SNAP_SHASUM,
      },
    });

    expect(result).toStrictEqual({
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

  it('returns verified for compatible Snaps', async () => {
    fetchMock
      .mockResponseOnce(JSON.stringify(MOCK_DATABASE_COMPATIBILITY))
      .mockResponseOnce(JSON.stringify(MOCK_COMPATIBILITY_SIGNATURE_FILE));

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

  it('returns unverified for non compatible Snaps', async () => {
    fetchMock
      .mockResponseOnce(JSON.stringify(MOCK_DATABASE_COMPATIBILITY))
      .mockResponseOnce(JSON.stringify(MOCK_COMPATIBILITY_SIGNATURE_FILE));

    const { messenger } = getRegistry();
    const result = await messenger.call('SnapsRegistry:get', {
      [MOCK_SNAP_ID]: {
        version: '1.1.0' as SemVerVersion,
        checksum: DEFAULT_SNAP_SHASUM,
      },
    });

    expect(result).toStrictEqual({
      [MOCK_SNAP_ID]: {
        status: SnapsRegistryStatus.Unverified,
      },
    });
  });

  it('uses existing state if registry is unavailable', async () => {
    fetchMock.mockResponse('', { status: 404 });

    const { messenger } = getRegistry({
      refetchOnAllowlistMiss: true,
      state: {
        lastUpdated: 0,
        database: MOCK_DATABASE,
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

  it(`doesn't use existing state if existing state isn't sufficient`, async () => {
    fetchMock.mockResponse('', { status: 404 });

    const { messenger } = getRegistry({
      refetchOnAllowlistMiss: true,
      state: {
        lastUpdated: 0,
        database: MOCK_DATABASE,
      },
    });

    const result = await messenger.call('SnapsRegistry:get', {
      [MOCK_SNAP_ID]: {
        version: '1.0.1' as SemVerVersion,
        checksum: DEFAULT_SNAP_SHASUM,
      },
    });

    expect(result).toStrictEqual({
      [MOCK_SNAP_ID]: {
        status: SnapsRegistryStatus.Unavailable,
      },
    });
  });

  it('returns unavailable if the database is unavailable', async () => {
    fetchMock.mockResponse('', { status: 404 });

    const { messenger } = getRegistry();

    const result = await messenger.call('SnapsRegistry:get', {
      [MOCK_SNAP_ID]: {
        version: '1.0.0' as SemVerVersion,
        checksum: DEFAULT_SNAP_SHASUM,
      },
    });

    expect(result).toStrictEqual({
      [MOCK_SNAP_ID]: {
        status: SnapsRegistryStatus.Unavailable,
      },
    });
  });

  it('returns unavailable if signature is unavailable', async () => {
    fetchMock
      .mockResponseOnce(JSON.stringify(MOCK_DATABASE))
      .mockResponseOnce('', {
        status: 404,
      });

    const { messenger } = getRegistry();

    const result = await messenger.call('SnapsRegistry:get', {
      [MOCK_SNAP_ID]: {
        version: '1.0.0' as SemVerVersion,
        checksum: DEFAULT_SNAP_SHASUM,
      },
    });

    expect(result).toStrictEqual({
      [MOCK_SNAP_ID]: {
        status: SnapsRegistryStatus.Unavailable,
      },
    });
  });

  it('returns unavailable if signature is invalid', async () => {
    fetchMock
      .mockResponseOnce(JSON.stringify(MOCK_DATABASE))
      .mockResponseOnce(JSON.stringify(MOCK_SIGNATURE_FILE));

    const { messenger } = getRegistry({
      publicKey:
        '0x034ca27b046507d1a9997bddc991b56d96b93d4adac3a96dfe01ce450bfb661455',
    });

    const result = await messenger.call('SnapsRegistry:get', {
      [MOCK_SNAP_ID]: {
        version: '1.0.0' as SemVerVersion,
        checksum: DEFAULT_SNAP_SHASUM,
      },
    });

    expect(result).toStrictEqual({
      [MOCK_SNAP_ID]: {
        status: SnapsRegistryStatus.Unavailable,
      },
    });
  });

  describe('resolveVersion', () => {
    it('resolves to an allowlisted version', async () => {
      fetchMock
        .mockResponseOnce(JSON.stringify(MOCK_DATABASE))
        .mockResponseOnce(JSON.stringify(MOCK_SIGNATURE_FILE));

      const { messenger } = getRegistry();
      const result = await messenger.call(
        'SnapsRegistry:resolveVersion',
        MOCK_SNAP_ID,
        '^1.0.0' as SemVerRange,
      );

      expect(result).toBe('1.0.0');
    });

    it('resolves to a compatible allowlisted version', async () => {
      fetchMock
        .mockResponseOnce(JSON.stringify(MOCK_DATABASE_COMPATIBILITY))
        .mockResponseOnce(JSON.stringify(MOCK_COMPATIBILITY_SIGNATURE_FILE));

      const { messenger } = getRegistry();
      const result = await messenger.call(
        'SnapsRegistry:resolveVersion',
        MOCK_SNAP_ID,
        '^1.0.0' as SemVerRange,
      );

      expect(result).toBe('1.0.0');
    });

    it('resolves to the latest allowlisted version if compatible', async () => {
      fetchMock
        .mockResponseOnce(JSON.stringify(MOCK_DATABASE_COMPATIBILITY))
        .mockResponseOnce(JSON.stringify(MOCK_COMPATIBILITY_SIGNATURE_FILE));

      const { messenger } = getRegistry({
        clientConfig: { type: 'extension', version: '15.0.0' as SemVerVersion },
      });
      const result = await messenger.call(
        'SnapsRegistry:resolveVersion',
        MOCK_SNAP_ID,
        '^1.0.0' as SemVerRange,
      );

      expect(result).toBe('1.1.0');
    });

    it('returns version range if snap is not on the allowlist', async () => {
      fetchMock
        .mockResponseOnce(
          JSON.stringify({ verifiedSnaps: {}, blockedSnaps: [] }),
        )
        .mockResponseOnce(JSON.stringify(MOCK_EMPTY_SIGNATURE_FILE));

      const range = '^1.0.0' as SemVerRange;
      const { messenger } = getRegistry();
      expect(
        await messenger.call(
          'SnapsRegistry:resolveVersion',
          MOCK_SNAP_ID,
          range,
        ),
      ).toBe(range);
    });

    it('returns version range if resolved version is not on the allowlist', async () => {
      fetchMock
        .mockResponseOnce(JSON.stringify(MOCK_DATABASE))
        .mockResponseOnce(JSON.stringify(MOCK_SIGNATURE_FILE));

      const range = '^1.2.0' as SemVerRange;
      const { messenger } = getRegistry();
      expect(
        await messenger.call(
          'SnapsRegistry:resolveVersion',
          MOCK_SNAP_ID,
          range,
        ),
      ).toBe(range);
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
      const result = await messenger.call(
        'SnapsRegistry:resolveVersion',
        MOCK_SNAP_ID,
        '^1.0.0' as SemVerRange,
      );

      expect(result).toBe('1.0.0');
    });

    it('refetches the database on allowlist version miss if configured', async () => {
      fetchMock
        .mockResponseOnce(JSON.stringify(MOCK_DATABASE))
        .mockResponseOnce(JSON.stringify(MOCK_SIGNATURE_FILE));

      const { messenger } = getRegistry({
        refetchOnAllowlistMiss: true,
        state: {
          lastUpdated: 0,
          database: {
            verifiedSnaps: {
              [MOCK_SNAP_ID]: {
                id: MOCK_SNAP_ID,
                metadata: {
                  name: 'Mock Snap',
                },
                versions: {
                  ['0.0.1' as SemVerVersion]: {
                    checksum: DEFAULT_SNAP_SHASUM,
                  },
                },
              },
            },
            blockedSnaps: [],
          },
        },
      });
      const result = await messenger.call(
        'SnapsRegistry:resolveVersion',
        MOCK_SNAP_ID,
        '^1.0.0' as SemVerRange,
      );

      expect(result).toBe('1.0.0');
    });
  });

  describe('getMetadata', () => {
    it('returns the metadata for a verified snap', async () => {
      fetchMock
        .mockResponseOnce(JSON.stringify(MOCK_DATABASE))
        .mockResponseOnce(JSON.stringify(MOCK_SIGNATURE_FILE));

      const { messenger } = getRegistry();
      await messenger.call('SnapsRegistry:update');
      const result = messenger.call('SnapsRegistry:getMetadata', MOCK_SNAP_ID);

      expect(result).toStrictEqual({
        name: 'Mock Snap',
      });
    });

    it('returns null for a non-verified snap', async () => {
      fetchMock
        .mockResponseOnce(JSON.stringify(MOCK_DATABASE))
        .mockResponseOnce(JSON.stringify(MOCK_SIGNATURE_FILE));

      const { messenger } = getRegistry();
      await messenger.call('SnapsRegistry:update');
      const result = messenger.call('SnapsRegistry:getMetadata', 'foo');

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

    it('skips update if the signature matches the existing one', async () => {
      const spy = jest.spyOn(globalThis.crypto.subtle, 'digest');

      fetchMock
        .mockResponseOnce(JSON.stringify(MOCK_DATABASE))
        .mockResponseOnce(JSON.stringify(MOCK_SIGNATURE_FILE));

      const { messenger } = getRegistry({
        state: {
          database: MOCK_DATABASE,
          signature: MOCK_SIGNATURE,
          lastUpdated: 0,
          databaseUnavailable: false,
        },
      });
      await messenger.call('SnapsRegistry:update');

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(spy).not.toHaveBeenCalled();
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

    it('does not fetch twice with parallel promises', async () => {
      fetchMock
        .mockResponseOnce(JSON.stringify(MOCK_DATABASE))
        .mockResponseOnce(JSON.stringify(MOCK_SIGNATURE_FILE));

      const { messenger } = getRegistry();
      await Promise.all([
        messenger.call('SnapsRegistry:update'),
        messenger.call('SnapsRegistry:update'),
      ]);

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('metadata', () => {
    it('includes expected state in debug snapshots', () => {
      const { registry } = getRegistry();

      expect(
        deriveStateFromMetadata(registry.state, registry.metadata, 'anonymous'),
      ).toMatchInlineSnapshot(`{}`);
    });

    it('includes expected state in state logs', () => {
      const { registry } = getRegistry();

      expect(
        deriveStateFromMetadata(
          registry.state,
          registry.metadata,
          'includeInStateLogs',
        ),
      ).toMatchInlineSnapshot(`
        {
          "database": null,
          "databaseUnavailable": false,
          "lastUpdated": null,
          "signature": null,
        }
      `);
    });

    it('persists expected state', () => {
      const { registry } = getRegistry();

      expect(
        deriveStateFromMetadata(registry.state, registry.metadata, 'persist'),
      ).toMatchInlineSnapshot(`
        {
          "database": null,
          "databaseUnavailable": false,
          "lastUpdated": null,
          "signature": null,
        }
      `);
    });

    it('exposes expected state to UI', () => {
      const { registry } = getRegistry();

      expect(
        deriveStateFromMetadata(registry.state, registry.metadata, 'usedInUi'),
      ).toMatchInlineSnapshot(`
        {
          "database": null,
        }
      `);
    });
  });
});
