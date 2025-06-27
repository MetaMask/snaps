import type { CaipAssetType, CaipAssetTypeOrId } from '@metamask/utils';

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
 * An asset value, which includes the asset type and the amount.
 *
 * @property asset - The CAIP-19 asset type or ID of the asset.
 * @property amount - The pice represented as a number in string format.
 */
export type AssetValue = {
  asset: CaipAssetTypeOrId;
  amount: string;
};

/**
 * The market data for a non-fungible asset.
 *
 * @property fungible - Indicates that this is a non-fungible asset.
 * This is always `false` for non-fungible assets.
 * @property lastSale - The last sale price of the asset, if available. See {@link AssetValue}.
 * @property topBid - The top bid price for the asset, if available. See {@link AssetValue}.
 * @property floorPrice - The floor price of the asset, if available. See {@link AssetValue}.
 * @property rarity - The rarity information for the asset, if available.
 * @property rarity.ranking - The ranking of the asset's rarity, if available.
 * @property rarity.ranking.source - The source of the rarity ranking.
 * @property rarity.ranking.rank - The rank of the asset in the rarity ranking.
 * @property rarity.metadata - Additional metadata about the asset's rarity, if available.
 * This is a record of string keys and number values.
 */
export type NonFungibleAssetMarketData = {
  fungible: false;
  lastSale?: AssetValue;
  topBid?: AssetValue;
  floorPrice?: AssetValue;
  rarity?: {
    ranking?: {
      source: string;
      rank: number;
    };
    metadata?: Record<string, number>;
  };
};

/**
 * The market data for an asset, which can be either fungible or non-fungible.
 */
export type AssetMarketData =
  | FungibleAssetMarketData
  | NonFungibleAssetMarketData;

/**
 * The arguments for the `onAssetsMarketData` handler.
 *
 * @property assets - An array of objects containing the asset and unit types.
 * @property assets.asset - The CAIP-19 asset type or ID of the asset.
 * @property assets.unit - The CAIP-19 asset type of the unit to use.
 */
export type OnAssetsMarketDataArguments = {
  assets: {
    asset: CaipAssetTypeOrId;
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
 * The response from the market data query, containing market data for the requested assets.
 *
 * @property marketData - A nested object with two CAIP-19 keys that contains a {@link AssetMarketData} object or null between the two keys.
 */
export type OnAssetsMarketDataResponse = {
  marketData: Record<
    CaipAssetTypeOrId,
    Record<CaipAssetType, AssetMarketData | null>
  >;
};
