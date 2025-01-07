import type { SimulationOptions } from '../../options';

/**
 * Get the implementation of the `getPreferences` hook.
 *
 * @param options - The simulation options.
 * @param options.currency - The currency to use.
 * @param options.locale - The locale to use.
 * @param options.hideBalances - Whether to hide balances.
 * @returns The implementation of the `getPreferences` hook.
 */
export function getGetPreferencesMethodImplementation({
  currency,
  locale,
  hideBalances,
}: SimulationOptions) {
  return () => {
    return { currency, locale, hideBalances };
  };
}
