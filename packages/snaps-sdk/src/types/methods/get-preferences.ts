/**
 * This method does not accept any parameters.
 */
export type GetPreferencesParams = never;

/**
 * An object containing the user's MetaMask preferences.
 */
export type GetPreferencesResult = {
  /**
   * The user's locale setting as a [language
   * code](https://github.com/MetaMask/metamask-extension/blob/develop/app/_locales/index.json).
   */
  locale: string;

  /**
   * The user's preferred fiat currency code (e.g., `"usd"`, `"eur"`).
   */
  currency: string;

  /**
   * Whether the user has chosen to hide balances in the MetaMask UI.
   */
  hideBalances: boolean;

  /**
   * Whether to run transactions and signatures through security alert
   * providers before submitting.
   */
  useSecurityAlerts: boolean;

  /**
   * Whether to simulate transactions and signatures to preview their effects
   * before the user confirms.
   */
  simulateOnChainActions: boolean;

  /**
   * Whether to automatically detect and add ERC-20 tokens to the user's
   * wallet.
   */
  useTokenDetection: boolean;

  /**
   * Whether to fetch token balances in an aggregated manner for improved
   * performance.
   */
  batchCheckBalances: boolean;

  /**
   * Whether to display NFT media (images, videos) in the MetaMask UI.
   */
  displayNftMedia: boolean;

  /**
   * Whether to automatically detect and add NFTs to the user's wallet.
   */
  useNftDetection: boolean;

  /**
   * Whether to fetch token price data from an external pricing source.
   */
  useExternalPricingData: boolean;

  /**
   * Whether to show testnet networks in the MetaMask UI.
   */
  showTestnets: boolean;
};
