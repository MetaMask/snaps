import { DEFAULT_SRP } from '../internals';
import type { SimulationOptions } from '../internals';

/**
 * Get the options for the simulation.
 *
 * @param options - The options for the simulation.
 * @param options.locale - The locale to use.
 * @param options.secretRecoveryPhrase - The secret recovery phrase to use.
 * @param options.state - The state to use.
 * @param options.unencryptedState - The unencrypted state to use.
 * @returns The options for the simulation.
 */
export function getMockOptions({
  locale = 'en',
  secretRecoveryPhrase = DEFAULT_SRP,
  state = null,
  unencryptedState = null,
}: Partial<SimulationOptions> = {}): SimulationOptions {
  return {
    locale,
    secretRecoveryPhrase,
    state,
    unencryptedState,
  };
}
