import type { Infer } from '@metamask/superstruct';
import {
  array,
  boolean,
  create,
  defaulted,
  nullable,
  object,
  optional,
  record,
  string,
} from '@metamask/superstruct';
import {
  CaipAssetTypeStruct,
  CaipChainIdStruct,
  JsonStruct,
} from '@metamask/utils';

import { DEFAULT_CURRENCY, DEFAULT_LOCALE, DEFAULT_SRP } from './constants';

const SimulationAccountStruct = object({
  address: string(),
  id: string(),
  scopes: array(CaipChainIdStruct),
  selected: defaulted(optional(boolean()), false),
  assets: defaulted(optional(array(CaipAssetTypeStruct)), []),
});

const SimulationAssetStruct = object({
  name: string(),
  symbol: string(),
});

const SimulationOptionsStruct = object({
  currency: defaulted(optional(string()), DEFAULT_CURRENCY),
  secretRecoveryPhrase: defaulted(optional(string()), DEFAULT_SRP),
  locale: defaulted(optional(string()), DEFAULT_LOCALE),
  state: defaulted(optional(nullable(record(string(), JsonStruct))), null),
  unencryptedState: defaulted(
    optional(nullable(record(string(), JsonStruct))),
    null,
  ),
  accounts: defaulted(optional(array(SimulationAccountStruct)), []),
  assets: defaulted(
    optional(record(CaipAssetTypeStruct, SimulationAssetStruct)),
    {},
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
 * @property unencryptedState - The initial unencrypted state of the Snap, if
 * any. Defaults to `null`.
 * @property accounts - The accounts to use in the simulation, if any. Defaults
 * to an empty array.
 * @property assets - The assets to use in the simulation, if any. Defaults to
 * an empty object.
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
