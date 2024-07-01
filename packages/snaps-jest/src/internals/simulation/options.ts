import type { Infer } from '@metamask/superstruct';
import {
  create,
  defaulted,
  nullable,
  object,
  optional,
  record,
  string,
} from '@metamask/superstruct';
import { JsonStruct } from '@metamask/utils';

import { DEFAULT_LOCALE, DEFAULT_SRP } from './constants';

const SimulationOptionsStruct = object({
  secretRecoveryPhrase: defaulted(optional(string()), DEFAULT_SRP),
  locale: defaulted(optional(string()), DEFAULT_LOCALE),
  state: defaulted(optional(nullable(record(string(), JsonStruct))), null),
  unencryptedState: defaulted(
    optional(nullable(record(string(), JsonStruct))),
    null,
  ),
});

/**
 * Options for the simulation.
 *
 * @property secretRecoveryPhrase - The secret recovery phrase to use. This is
 * used to derive addresses and private keys. Defaults to a test recovery
 * phrase.
 * @property locale - The locale to use. Defaults to `en`.
 * @property state - The initial state of the Snap, if any. Defaults to `null`.
 */
export type SimulationUserOptions = Infer<typeof SimulationOptionsStruct>;

/**
 * Options for the simulation, with defaults filled in.
 *
 * See {@link SimulationUserOptions} for documentation.
 */
export type SimulationOptions = Required<SimulationUserOptions>;

/**
 * Get the options for the simulation.
 *
 * @param options - The user options. Any options not specified will be filled
 * in with default values.
 * @returns The simulation options.
 */
export function getOptions(options: SimulationUserOptions): SimulationOptions {
  return create(
    options,
    SimulationOptionsStruct,
  ) as Required<SimulationUserOptions>;
}
