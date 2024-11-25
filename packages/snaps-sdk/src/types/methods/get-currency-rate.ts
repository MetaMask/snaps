export type Currency<Value extends string> =
  | Lowercase<Value>
  | Uppercase<Value>;

export type AvailableCurrency = Currency<'btc'> | Currency<'sol'>;

/**
 * The currency rate object.
 *
 * @property currency - The native currency symbol used for the conversion (e.g 'usd').
 * @property conversionRate - The conversion rate from the cryptocurrency to the native currency.
 * @property conversionDate - The date of the conversion rate as a UNIX timestamp.
 * @property usdConversionRate - The conversion rate to USD.
 */
export type CurrencyRate = {
  currency: string;
  conversionRate: number;
  conversionDate: number;
  usdConversionRate?: number;
};

/**
 * The request parameters for the `snap_getCurrencyRate` method.
 *
 * @property currency - The currency symbol.
 */
export type GetCurrencyRateParams = {
  currency: AvailableCurrency;
};

/**
 * The result returned by the `snap_getCurrencyRate` method, which is the {@link CurrencyRate} object.
 */
export type GetCurrencyRateResult = CurrencyRate | null;
