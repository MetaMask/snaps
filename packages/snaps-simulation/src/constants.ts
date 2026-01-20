import type { SimulationAccount } from './options';

/**
 * A secret recovery phrase that is used for testing purposes. Do not use this
 * to store any real funds!
 */
export const DEFAULT_SRP =
  'test test test test test test test test test test test ball';

/**
 * An alternative secret recovery phrase that is used for testing purposes. Do
 * not use this to store any real funds!
 */
export const DEFAULT_ALTERNATIVE_SRP =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

/**
 * The default locale.
 */
export const DEFAULT_LOCALE = 'en';

/**
 * The default currency.
 */
export const DEFAULT_CURRENCY = 'usd';

/**
 * The types of inputs that can be used in the `typeInField` interface action.
 */
export const TYPEABLE_INPUTS = ['Input', 'AddressInput'];

export const DEFAULT_ACCOUNTS: SimulationAccount[] = [
  {
    address: '0xc6d5a3c98ec9073b54fa0969957bd582e8d874bf',
    id: '29bc7513-d1b9-4466-98a6-f5f9e0b90137',
    scopes: ['eip155:0'],
    selected: false,
    owned: false,
    // We don't expose assets for EVM accounts as it's not supported in the AssetSelector.
    assets: [],
  },
  {
    address: 'CYWSQQ2iiFL6EZzuqvMM9o22CZX3N8PowvvkpBXqLK4e',
    id: 'e051723c-85d0-43a3-b9bf-568a90d3f378',
    scopes: [
      'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
      'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
      'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
    ],
    selected: true,
    owned: true,
    assets: [
      'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501',
      'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    ],
  },
];

export const DEFAULT_ASSETS = {
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
