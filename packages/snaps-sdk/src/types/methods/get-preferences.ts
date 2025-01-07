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
 */
export type GetPreferencesResult = {
  locale: string;
  currency: string;
  hideBalances: boolean;
};
