export type Currency = 'btc';

/**
 * The currency rate object.
 *
 * @property conversionRate - The conversion rate. It maps a currency code (e.g. "btc") to its
 * conversion rate
 * @property conversionDate - The date of the conversion rate as a UNIX timestamp.
 * @property usdConversionRate - The conversion rate to USD.
 */
export type CurrencyRate = {
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
 * The result returned by the `snap_getCurrencyRate` method, which is the {@link CurrencyRate} object.
 */
export type GetCurrencyRateResult = CurrencyRate | null;
