import type { CaipAssetType } from '@metamask/utils';

/**
 * The market data for a fungible asset.
 *
 * @property fungible - Indicates that this is a fungible asset.
 * This is always `true` for fungible assets.
 * @property marketCap - The market capitalization of the asset.
 * @property totalVolume - The total volume of the asset.
 * @property circulatingSupply - The circulating supply of the asset.
 * @property allTimeHigh - The all-time high price of the asset.
 * @property allTimeLow - The all-time low price of the asset.
 * @property pricePercentChange - The percentage change in price over different intervals.
 * @property pricePercentChange.interval - The time interval for the price change as a ISO 8601 duration
 * or the string "all" to represent the all-time change.
 */
export type FungibleAssetMarketData = {
  fungible: true;
  marketCap?: string;
  totalVolume?: string;
  circulatingSupply?: string;
  allTimeHigh?: string;
  allTimeLow?: string;
  pricePercentChange?: {
    [interval: string]: number;
  };
};

/**
 * The arguments for the `onAssetsMarketData` handler.
 *
 * @property assets - An object containing the asset and unit types.
 * @property assets.asset - The CAIP-19 asset type of the asset.
 * @property assets.unit - The CAIP-19 asset type of the unit to use.
 */
export type OnAssetsMarketDataArguments = {
  assets: {
    asset: CaipAssetType;
    unit: CaipAssetType;
  }[];
};

/**
 * The `onAssetsMarketData` handler. This is called by MetaMask when querying about market data for a specific asset.
 *
 * @param args - The arguments for the handler.
 * see {@link OnAssetsMarketDataArguments}.
 * @returns The market data for the asset. See {@link OnAssetsMarketDataResponse}.
 */
export type OnAssetsMarketDataHandler = (
  args: OnAssetsMarketDataArguments,
) => Promise<OnAssetsMarketDataResponse>;

/**
 * The response from the market data query, containing market data for the requested asset.
 *
 * @property marketData - A nested object with two CAIP-19 keys that contains a {@link FungibleAssetMarketData} object or null between the two keys.
 */
export type OnAssetsMarketDataResponse = {
  marketData: Record<
    CaipAssetType,
    Record<CaipAssetType, FungibleAssetMarketData | null>
  >;
};
