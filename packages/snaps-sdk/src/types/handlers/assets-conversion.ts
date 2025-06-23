import { type CaipAssetType } from '@metamask/utils';
/**
 * The conversion rate between two assets.
 *
 * @property rate - The conversion rate between the two assets.
 * @property conversionTime - The time at which the conversion rate was calculated.
 * @property expirationTime - The time at which the conversion rate expires.
 */
export type AssetConversion = {
  rate: string;
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
