import type { CaipAssetType } from '@metamask/utils';

export type OnAssetsConversionArguments = {
  conversions: { from: CaipAssetType; to: CaipAssetType }[];
};

/**
 * The `onAssetsConversion` handler. This is called by MetaMask when querying about asset conversion on specific chains.
 *
 * @returns The conversion for each asset. See
 * {@link OnAssetsConversionResponse}.
 */
export type OnAssetsConversionHandler = (
  args: OnAssetsConversionArguments,
) => Promise<OnAssetsConversionResponse>;

/**
 * The response from the conversion query, containing rates about each requested asset pair.
 *
 * @property conversionRates - A nested object with two CAIP-19 keys that contains a conversion rate between the two keys.
 */
export type OnAssetsConversionResponse = {
  conversionRates: Record<CaipAssetType, Record<CaipAssetType, any>>;
};
