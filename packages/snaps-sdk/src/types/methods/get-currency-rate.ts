export type Currency = 'btc';

/**
 * The rate object.
 *
 * @property conversionRate - The conversion rate. It maps a currency code (e.g. "btc") to its
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
 * The request parameters for the `snap_getCurrencyRate` method.
 *
 * @property currency - The currency symbol.
 */
export type GetCurrencyRateParams = {
  currency: Currency;
};

/**
 * The result returned by the `snap_getCurrencyRate` method, which is the {@link Rate} object.
 */
export type GetCurrencyRateResult = Rate | null;
