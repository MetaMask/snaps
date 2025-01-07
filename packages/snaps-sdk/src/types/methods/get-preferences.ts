/**
 * The request parameters for the `snap_getPreferences` method.
 *
 * This method does not accept any parameters.
 */
export type GetPreferencesParams = never;

/**
 * The result returned by the `snap_getPreferences` method.
 *
 * It is the user selected preferences from the MetaMask extension.
 *
 * @property locale - The user's selected locale.
 * @property currency - The user's selected currency.
 * @property hideBalances - Whether the user has chosen to hide balances.
 */
export type GetPreferencesResult = {
  locale: string;
  currency: string;
  hideBalances: boolean;
};
