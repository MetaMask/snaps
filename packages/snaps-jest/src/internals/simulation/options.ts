import { JsonStruct } from '@metamask/utils';
import type { Infer } from 'superstruct';
import {
  defaulted,
  nullable,
  object,
  optional,
  record,
  string,
} from 'superstruct';

import { DEFAULT_SRP } from './constants';

export const SimulationOptionsStruct = object({
  secretRecoveryPhrase: defaulted(optional(string()), DEFAULT_SRP),
  locale: defaulted(optional(string()), 'en'),
  state: defaulted(optional(nullable(record(string(), JsonStruct))), null),
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
