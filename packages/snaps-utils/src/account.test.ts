import type { SnapId } from '@metamask/snaps-sdk';

import {
  createAccountList,
  createChainIdList,
  snapOwnsAccount,
} from './account';
import { MOCK_SNAP_ID } from './test-utils';

describe('createAccountList', () => {
  it('creates an account list from an address and a list of chain IDs', () => {
    const result = createAccountList(
      '0x1234567890123456789012345678901234567890',
      ['eip155:1', 'eip155:2'],
    );

    expect(result).toStrictEqual([
      'eip155:1:0x1234567890123456789012345678901234567890',
      'eip155:2:0x1234567890123456789012345678901234567890',
    ]);
  });
});

describe('createChainIdList', () => {
  it('creates a chain ID list from account scopes and requested chain IDs', () => {
    const result = createChainIdList(
      ['eip155:1', 'eip155:2'],
      ['eip155:1', 'eip155:3'],
    );

    expect(result).toStrictEqual(['eip155:1']);
  });

  it('returns all account scopes if no requested chain IDs are provided', () => {
    const result = createChainIdList(['eip155:1', 'eip155:2']);

    expect(result).toStrictEqual(['eip155:1', 'eip155:2']);
  });

  it('returns all requested chain IDs if the scope represents all EVM compatible chains', () => {
    const result = createChainIdList(['eip155:0'], ['eip155:1', 'eip155:2']);

    expect(result).toStrictEqual(['eip155:1', 'eip155:2']);
  });

  it('returns "eip155:0" if the scope represents all EVM compatible chains', () => {
    const result = createChainIdList(['eip155:0']);

    expect(result).toStrictEqual(['eip155:0']);
  });
});

describe('snapOwnsAccount', () => {
  it('returns true if the snap owns the account', () => {
    const result = snapOwnsAccount(MOCK_SNAP_ID, {
      id: 'eip155:1:0x1234567890123456789012345678901234567890',
      scopes: ['eip155:1'],
      metadata: {
        // @ts-expect-error partial mock
        snap: {
          id: MOCK_SNAP_ID,
        },
      },
    });

    expect(result).toBe(true);
  });

  it('returns false if the snap does not own the account', () => {
    const result = snapOwnsAccount(MOCK_SNAP_ID, {
      id: 'eip155:2:0x1234567890123456789012345678901234567890',
      scopes: ['eip155:1'],
      metadata: {
        // @ts-expect-error partial mock
        snap: {
          id: 'npm:other-snap' as SnapId,
        },
      },
    });

    expect(result).toBe(false);
  });
});
