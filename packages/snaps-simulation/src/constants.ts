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
 * The default JSON-RPC endpoint for Ethereum requests.
 */
export const DEFAULT_JSON_RPC_ENDPOINT = 'https://cloudflare-eth.com/';

/**
 * The types of inputs that can be used in the `typeInField` interface action.
 */
export const TYPEABLE_INPUTS = ['Input', 'AddressInput'];

export const DEFAULT_ACCOUNTS: SimulationAccount[] = [
  {
    address: '0x1234567890abcdef1234567890abcdef12345678',
    id: '29bc7513-d1b9-4466-98a6-f5f9e0b90137',
    scopes: ['eip155:0'],
    selected: false,
    // We don't expose assets for EVM accounts as it's not supported in the AssetSelector.
    assets: [],
  },
  {
    address: '7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
    id: 'e051723c-85d0-43a3-b9bf-568a90d3f378',
    scopes: [
      'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
      'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
      'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
    ],
    selected: true,
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
