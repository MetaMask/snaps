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
 * @returns The options for the simulation.
 */
export function getMockOptions({
  currency = 'usd',
  locale = 'en',
  hideBalances = false,
  secretRecoveryPhrase = DEFAULT_SRP,
  state = null,
  unencryptedState = null,
}: Partial<SimulationOptions> = {}): SimulationOptions {
  return {
    currency,
    locale,
    secretRecoveryPhrase,
    state,
    unencryptedState,
    hideBalances,
  };
}
