import { DEFAULT_SRP } from '../constants';
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
 * @param options.enableAnalytics - Whether to enable analytics.
 * @returns The options for the simulation.
 */
export function getMockOptions({
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
  enableAnalytics = true,
}: Partial<SimulationOptions> = {}): SimulationOptions {
  return {
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
    enableAnalytics,
  };
}
