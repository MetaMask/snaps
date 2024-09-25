export type Cryptocurrency = 'btc';

/**
 * The rate object.
 *
 * @property conversionRate - The conversion rate. It maps a cryptocurrency code (e.g., "BTC") to its
 * conversion rate
 * @property conversionDate - The date of the conversion rate as a UNIX timestamp.
 * @property usdConversionRate - The conversion rate to USD.
 */
export type Rate = {
  conversionRate: string;
  conversionDate: number;
  usdConversionRate?: string;
};

/**
 * The request parameters for the `snap_getRate` method.
 *
 * @property cryptocurrency - The cryptocurrency symbol.
 */
export type GetRateParams = {
  cryptocurrency: Cryptocurrency;
};

/**
 * The result returned by the `snap_getRate` method, which is the {@link Rate} object.
 */
export type GetRateResult = Rate | null;
