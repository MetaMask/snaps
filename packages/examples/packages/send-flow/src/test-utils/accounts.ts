import { getMockAccount } from '@metamask/snaps-jest';
import type { SimulationAsset } from '@metamask/snaps-jest';
import type { CaipAssetType } from '@metamask/utils';

export const MOCK_ACCOUNT_1 = getMockAccount({
  address: '7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
  selected: true,
  assets: [
    'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501',
    'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  ],
});

export const MOCK_ACCOUNT_2 = getMockAccount({
  address: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
  selected: false,
  assets: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501'],
});

export const MOCK_ACCOUNTS = [MOCK_ACCOUNT_1, MOCK_ACCOUNT_2];

export const MOCK_ASSETS: Record<CaipAssetType, SimulationAsset> = {
  'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501': {
    name: 'Solana',
    symbol: 'SOL',
  },
  'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v':
    {
      name: 'USDC',
      symbol: 'USDC',
    },
};

export const MOCK_OPTIONS = {
  accounts: MOCK_ACCOUNTS,
  assets: MOCK_ASSETS,
};
