import { DEFAULT_ACCOUNTS, DEFAULT_ASSETS, DEFAULT_SRP } from '../constants';
import type { SimulationOptions } from '../options';
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
  accounts = DEFAULT_ACCOUNTS,
  assets = DEFAULT_ASSETS,
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
