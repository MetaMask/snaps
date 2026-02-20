/**
 * The request parameters for the `snap_getPreferences` method.
 *
 * This method does not accept any parameters.
 */
export type GetPreferencesParams = never;

/**
 * An object containing the user's preferences.
 *
 * @property locale - The user's locale setting as a language code.
 * @property currency - The user's preferred fiat currency code.
 * @property hideBalances - Whether the user has chosen to hide balances.
 * @property useSecurityAlerts - Whether to run transactions and signatures
 * through security providers.
 * @property simulateOnChainActions - Whether to simulate transactions and
 * signatures.
 * @property useTokenDetection - Whether to auto-detect tokens.
 * @property batchCheckBalances - Whether to fetch balances in an aggregated
 * manner.
 * @property displayNftMedia - Whether to display NFT media.
 * @property useNftDetection - Whether to auto-detect NFTs.
 * @property useExternalPricingData - Whether to get token price data from an
 * external source.
 * @property showTestnets - Whether to show testnets.
 */
export type GetPreferencesResult = {
  locale: string;
  currency: string;
  hideBalances: boolean;
  useSecurityAlerts: boolean;
  simulateOnChainActions: boolean;
  useTokenDetection: boolean;
  batchCheckBalances: boolean;
  displayNftMedia: boolean;
  useNftDetection: boolean;
  useExternalPricingData: boolean;
  showTestnets: boolean;
};
