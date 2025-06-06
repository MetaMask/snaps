import type { Infer } from '@metamask/superstruct';
import {
  boolean,
  create,
  defaulted,
  nullable,
  object,
  optional,
  record,
  string,
} from '@metamask/superstruct';
import { JsonStruct } from '@metamask/utils';

import { DEFAULT_CURRENCY, DEFAULT_LOCALE, DEFAULT_SRP } from './constants';

const SimulationOptionsStruct = object({
  currency: defaulted(optional(string()), DEFAULT_CURRENCY),
  secretRecoveryPhrase: defaulted(optional(string()), DEFAULT_SRP),
  locale: defaulted(optional(string()), DEFAULT_LOCALE),
  state: defaulted(optional(nullable(record(string(), JsonStruct))), null),
  unencryptedState: defaulted(
    optional(nullable(record(string(), JsonStruct))),
    null,
  ),
  hideBalances: defaulted(optional(boolean()), false),
  useSecurityAlerts: defaulted(optional(boolean()), true),
  simulateOnChainActions: defaulted(optional(boolean()), true),
  useTokenDetection: defaulted(optional(boolean()), true),
  batchCheckBalances: defaulted(optional(boolean()), true),
  displayNftMedia: defaulted(optional(boolean()), true),
  useNftDetection: defaulted(optional(boolean()), true),
  useExternalPricingData: defaulted(optional(boolean()), true),
  showTestnets: defaulted(optional(boolean()), true),
});

/**
 * Options for the simulation.
 *
 * @property currency - The currency to use. Defaults to `usd`.
 * @property secretRecoveryPhrase - The secret recovery phrase to use. This is
 * used to derive addresses and private keys. Defaults to a test recovery
 * phrase.
 * @property locale - The locale to use. Defaults to `en`.
 * @property state - The initial state of the Snap, if any. Defaults to `null`.
 * @property useSecurityAlerts - Whether to run transactions and signatures through security providers.
 * @property simulateOnChainActions - Whether to simulate transactions and signatures.
 * @property useTokenDetection - Whether to auto-detect tokens.
 * @property batchCheckBalances - Whether to fetch balances in an aggregated manner.
 * @property displayNftMedia - Whether to display NFT media.
 * @property useNftDetection - Whether to auto-detect NFTs.
 * @property useExternalPricingData - Whether to get token price data from an external source.
 * @property showTestnets - Whether to show testnets.
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
