import { SemVerVersion } from '@metamask/snaps-utils';
import {
  DEFAULT_SNAP_SHASUM,
  MOCK_SNAP_ID,
} from '@metamask/snaps-utils/test-utils';
import fetchMock from 'jest-fetch-mock';

import { JsonSnapRegistry } from './json';
import { SnapRegistryStatus } from './registry';

const MOCK_DATABASE = {
  [MOCK_SNAP_ID]: {
    id: MOCK_SNAP_ID,
    versions: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '1.0.0': {
        checksum: DEFAULT_SNAP_SHASUM,
        status: SnapRegistryStatus.Verified,
      },
    },
  },
};

describe('JsonSnapRegistry', () => {
  fetchMock.enableMocks();
  it('can get entries from the registry', async () => {
    fetchMock.mockResponse(JSON.stringify(MOCK_DATABASE));
    const registry = new JsonSnapRegistry();
    const result = await registry.get({
      [MOCK_SNAP_ID]: {
        version: '1.0.0' as SemVerVersion,
        shasum: DEFAULT_SNAP_SHASUM,
      },
    });

    expect(result).toStrictEqual({
      [MOCK_SNAP_ID]: {
        status: SnapRegistryStatus.Verified,
      },
    });
  });

  it('returns unverified for non existing snaps', async () => {
    // Empty database
    fetchMock.mockResponse(JSON.stringify({}));
    const registry = new JsonSnapRegistry();
    const result = await registry.get({
      [MOCK_SNAP_ID]: {
        version: '1.0.0' as SemVerVersion,
        shasum: DEFAULT_SNAP_SHASUM,
      },
    });

    expect(result).toStrictEqual({
      [MOCK_SNAP_ID]: {
        status: SnapRegistryStatus.Unverified,
      },
    });
  });

  it('returns unverified for non existing versions', async () => {
    fetchMock.mockResponse(JSON.stringify(MOCK_DATABASE));
    const registry = new JsonSnapRegistry();
    const result = await registry.get({
      [MOCK_SNAP_ID]: {
        version: '1.0.1' as SemVerVersion,
        shasum: DEFAULT_SNAP_SHASUM,
      },
    });

    expect(result).toStrictEqual({
      [MOCK_SNAP_ID]: {
        status: SnapRegistryStatus.Unverified,
      },
    });
  });

  it('returns unverified if existing snap doesnt match checksum', async () => {
    fetchMock.mockResponse(JSON.stringify(MOCK_DATABASE));
    const registry = new JsonSnapRegistry();
    const result = await registry.get({
      [MOCK_SNAP_ID]: {
        version: '1.0.0' as SemVerVersion,
        shasum: 'foo',
      },
    });

    expect(result).toStrictEqual({
      [MOCK_SNAP_ID]: {
        status: SnapRegistryStatus.Unverified,
      },
    });
  });
});
