import { type CaipAssetType } from '@metamask/utils';

/**
 * The market data for an asset.
 *
 * @property marketCap - The market capitalization of the asset.
 * @property totalVolume - The total volume of the asset.
 * @property circulatingSupply - The circulating supply of the asset.
 * @property allTimeHigh - The all-time high price of the asset.
 * @property allTimeLow - The all-time low price of the asset.
 * @property pricePercentChange - The percentage change in price over different intervals.
 * @property pricePercentChange.interval - The time interval for the price change as a ISO 8601 duration
 * or the string "all" to represent the all-time change.
 */
export type MarketData = {
  marketCap: string;
  totalVolume: string;
  circulatingSupply: string;
  allTimeHigh: string;
  allTimeLow: string;
  pricePercentChange: {
    [interval: string]: number;
  };
};

/**
 * The conversion rate between two assets.
 *
 * @property rate - The conversion rate between the two assets.
 * @property marketData - The market data for the asset, if requested.
 * @property conversionTime - The time at which the conversion rate was calculated.
 * @property expirationTime - The time at which the conversion rate expires.
 */
export type AssetConversion = {
  rate: string;
  marketData?: MarketData;
  conversionTime: number;
  expirationTime?: number;
};

/**
 * The arguments for the `onAssetsConversion` handler.
 *
 * @property conversions - An array of objects containing the `from` and `to` asset types.
 * @property includeMarketData - Whether to include market data in the response.
 */
export type OnAssetsConversionArguments = {
  conversions: { from: CaipAssetType; to: CaipAssetType }[];
  includeMarketData?: boolean;
};

/**
 * The `onAssetsConversion` handler. This is called by MetaMask when querying about asset conversion on specific chains.
 *
 * @param args - The arguments for the handler.
 * see {@link OnAssetsConversionArguments}.
 * @returns The conversion for each asset. See
 * {@link OnAssetsConversionResponse}.
 */
export type OnAssetsConversionHandler = (
  args: OnAssetsConversionArguments,
) => Promise<OnAssetsConversionResponse>;

/**
 * The response from the conversion query, containing rates about each requested asset pair.
 *
 * @property conversionRates - A nested object with two CAIP-19 keys that contains a conversion rate or null between the two keys.
 */
export type OnAssetsConversionResponse = {
  conversionRates: Record<
    CaipAssetType,
    Record<CaipAssetType, AssetConversion | null>
  >;
};
