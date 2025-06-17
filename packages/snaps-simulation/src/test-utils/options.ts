import type { CaipAssetType, CaipChainId } from '@metamask/utils';

import { DEFAULT_SRP } from '../constants';
import type { SimulationOptions } from '../options';

export const MOCK_ACCOUNTS = [
  {
    address: '0x1234567890abcdef1234567890abcdef12345678',
    id: '29bc7513-d1b9-4466-98a6-f5f9e0b90137',
    scopes: ['eip155:0'] as CaipChainId[],
    selected: false,
    assets: [
      'eip155:1/erc20:0x6b175474e89094c44da98b954eedeac495271d0f',
    ] as CaipAssetType[],
  },
  {
    address: '7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
    id: 'e051723c-85d0-43a3-b9bf-568a90d3f378',
    scopes: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'] as CaipChainId[],
    selected: true,
    assets: [
      'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    ] as CaipAssetType[],
  },
];

export const MOCK_ASSETS = {
  'eip155:1/erc20:0x6b175474e89094c44da98b954eedeac495271d0f': {
    name: 'Dai Stablecoin',
    symbol: 'DAI',
  },
  'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v':
    {
      name: 'USDC',
      symbol: 'USDC',
    },
};

/**
 * Get the options for the simulation.
 *
 * @param options - The options for the simulation.
 * @param options.currency - The currency to use.
 * @param options.locale - The locale to use.
 * @param options.secretRecoveryPhrase - The secret recovery phrase to use.
 * @param options.state - The state to use.
 * @param options.unencryptedState - The unencrypted state to use.
 * @param options.hideBalances - Whether to hide balances.
 * @param options.useSecurityAlerts - Whether to run transactions and signatures through security providers.
 * @param options.simulateOnChainActions - Whether to simulate transactions and signatures.
 * @param options.useTokenDetection - Whether to auto-detect tokens.
 * @param options.batchCheckBalances - Whether to fetch balances in an aggregated manner.
 * @param options.displayNftMedia - Whether to display NFT media.
 * @param options.useNftDetection - Whether to auto-detect NFTs.
 * @param options.useExternalPricingData - Whether to get token price data from an external source.
 * @param options.showTestnets - Whether to show testnets.
 * @param options.accounts - The accounts to use in the simulation.
 * @param options.assets - The assets to use in the simulation.
 * @returns The options for the simulation.
 */
export function getMockOptions({
  accounts = [],
  assets = {},
  currency = 'usd',
  locale = 'en',
  hideBalances = false,
  secretRecoveryPhrase = DEFAULT_SRP,
  state = null,
  unencryptedState = null,
  useSecurityAlerts = true,
  simulateOnChainActions = true,
  useTokenDetection = true,
  batchCheckBalances = true,
  displayNftMedia = true,
  useNftDetection = true,
  useExternalPricingData = true,
  showTestnets = true,
}: Partial<SimulationOptions> = {}): SimulationOptions {
  return {
    accounts,
    assets,
    currency,
    locale,
    secretRecoveryPhrase,
    state,
    unencryptedState,
    hideBalances,
    useSecurityAlerts,
    simulateOnChainActions,
    useTokenDetection,
    batchCheckBalances,
    displayNftMedia,
    useNftDetection,
    useExternalPricingData,
    showTestnets,
  };
}
