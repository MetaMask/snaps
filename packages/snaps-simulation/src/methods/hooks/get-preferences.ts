import type { SimulationOptions } from '../../options';

/**
 * Get the implementation of the `getPreferences` hook.
 *
 * @param options - The simulation options.
 * @param options.currency - The currency to use.
 * @param options.locale - The locale to use.
 * @param options.hideBalances - Whether to hide balances.
 * @param options.useSecurityAlerts - Whether to run transactions and signatures through security providers.
 * @param options.useSimulations - Whether to simulate transactions and signatures.
 * @param options.useTokenDetection - Whether to auto-detect tokens.
 * @param options.batchCheckBalances - Whether to fetch balances in an aggregated manner.
 * @param options.displayNftMedia - Whether to display NFT media.
 * @param options.useNftDetection - Whether to auto-detect NFTs.
 * @param options.usePriceCheck - Whether to get token price data from an external source.
 * @returns The implementation of the `getPreferences` hook.
 */
export function getGetPreferencesMethodImplementation({
  currency,
  locale,
  hideBalances,
  useSecurityAlerts,
  useSimulations,
  useTokenDetection,
  batchCheckBalances,
  displayNftMedia,
  useNftDetection,
  usePriceCheck,
}: SimulationOptions) {
  return () => {
    return {
      currency,
      locale,
      hideBalances,
      useSecurityAlerts,
      useSimulations,
      useTokenDetection,
      batchCheckBalances,
      displayNftMedia,
      useNftDetection,
      usePriceCheck,
    };
  };
}
