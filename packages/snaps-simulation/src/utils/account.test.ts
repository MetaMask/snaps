import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';

import { addSnapMetadataToAccount } from './account';
import type { SimulationAccount } from '../options';

describe('addSnapMetadataToAccount', () => {
  it('adds snap metadata to an owned account', () => {
    const account: SimulationAccount = {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      selected: true,
      address: '7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
      owned: true,
      scopes: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
      assets: [
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:105',
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      ],
    };

    const result = addSnapMetadataToAccount(account, MOCK_SNAP_ID);

    expect(result).toStrictEqual({
      ...account,
      metadata: {
        snap: {
          id: MOCK_SNAP_ID,
        },
      },
    });
  });

  it('returns an account without snap metadata if not owned', () => {
    const account: SimulationAccount = {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      selected: true,
      address: '7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
      owned: false,
      scopes: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
      assets: [
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:105',
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      ],
    };

    const result = addSnapMetadataToAccount(account, MOCK_SNAP_ID);

    expect(result).toStrictEqual({
      ...account,
      metadata: {},
    });
  });
});
