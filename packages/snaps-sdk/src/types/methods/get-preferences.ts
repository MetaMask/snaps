/**
 * The request parameters for the `snap_getPreferences` method.
 *
 * This method does not accept any parameters.
 */
export type GetPreferencesParams = never;

/**
 * The result returned by the `snap_getPreferences` method.
 *
 * It is the user selected preferences from the MetaMask client.
 *
 * @property locale - The user's selected locale.
 * @property currency - The user's selected currency.
 * @property hideBalances - Whether the user has chosen to hide balances.
 * @property useSecurityAlerts - Whether to run transactions and signatures through blockaid.
 * @property useSimulations - Whether to simulate transactions and signatures.
 * @property useTokenDetection - Whether to auto-detect tokens.
 * @property batchCheckBalances - Whether to fetch balances in an aggregated manner.
 * @property displayNftMedia - Whether to display NFT media.
 * @property useNftDetection - Whether to auto-detect NFTs.
 * @property usePriceCheck - Whether to get token price data from CoinGecko and CryptoCompare.
 */
export type GetPreferencesResult = {
  locale: string;
  currency: string;
  hideBalances: boolean;
  useSecurityAlerts: boolean;
  useSimulations: boolean;
  useTokenDetection: boolean;
  batchCheckBalances: boolean;
  displayNftMedia: boolean;
  useNftDetection: boolean;
  usePriceCheck: boolean;
};
