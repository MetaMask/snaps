import { nonEmptyRecord, selectiveUnion } from '@metamask/snaps-sdk';
import {
  literal,
  nullable,
  number,
  object,
  optional,
  record,
  string,
  union,
} from '@metamask/superstruct';
import {
  CaipAssetTypeOrIdStruct,
  CaipAssetTypeStruct,
  isObject,
} from '@metamask/utils';

import { ISO8601DurationStruct } from '../time';

/**
 * A struct representing the market data for an asset.
 */
export const PricePercentChangeStruct = nonEmptyRecord(
  union([literal('all'), ISO8601DurationStruct]),
  number(),
);

/**
 * A struct representing the market data for a fungible asset.
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
export const FungibleAssetMarketDataStruct = object({
  fungible: literal(true),
  marketCap: optional(string()),
  totalVolume: optional(string()),
  circulatingSupply: optional(string()),
  allTimeHigh: optional(string()),
  allTimeLow: optional(string()),
  pricePercentChange: optional(PricePercentChangeStruct),
});

/**
 * A struct representing an asset value, which includes the asset type and the amount.
 *
 * @property asset - The CAIP-19 asset type or ID of the asset.
 * @property amount - The price represented as a number in string format.
 */
export const AssetValueStruct = object({
  asset: CaipAssetTypeOrIdStruct,
  amount: string(),
});

/**
 * A struct representing the market data for a non-fungible asset.
 *
 * @property asset - The CAIP-19 asset type or ID of the asset.
 * @property amount - The price represented as a number in string format.
 * @property fungible - Indicates that this is a non-fungible asset.
 * This is always `false` for non-fungible assets.
 * @property lastSale - The last sale price of the asset, if available. See {@link AssetValueStruct}.
 * @property topBid - The top bid price for the asset, if available. See {@link AssetValueStruct}.
 * @property floorPrice - The floor price of the asset, if available. See {@link AssetValueStruct}.
 * @property rarity - The rarity information for the asset, if available.
 * @property rarity.ranking - The ranking of the asset's rarity, if available.
 * @property rarity.ranking.source - The source of the rarity ranking.
 * @property rarity.ranking.rank - The rank of the asset in the rarity ranking.
 * @property rarity.metadata - Additional metadata about the asset's rarity, if available.
 * This is a record of string keys and number values.
 */
export const NonFungibleAssetMarketDataStruct = object({
  fungible: literal(false),
  lastSale: optional(AssetValueStruct),
  topBid: optional(AssetValueStruct),
  floorPrice: optional(AssetValueStruct),
  rarity: optional(
    object({
      ranking: optional(
        object({
          source: string(),
          rank: number(),
        }),
      ),
      metadata: optional(record(string(), number())),
    }),
  ),
});

/**
 * A struct representing the market data for an asset, which can be either {@link FungibleAssetMarketDataStruct} or {@link NonFungibleAssetMarketDataStruct}.
 */
export const AssetMarketDataStruct = selectiveUnion((marketData) => {
  if (isObject(marketData) && marketData.fungible) {
    return FungibleAssetMarketDataStruct;
  }

  return NonFungibleAssetMarketDataStruct;
});

/**
 * A struct representing the response of the `onAssetsMarketData` method.
 *
 * @property marketData - A nested object with two CAIP-19 keys that contains a {@link AssetMarketData} object or null.
 */
export const OnAssetsMarketDataResponseStruct = object({
  marketData: record(
    CaipAssetTypeOrIdStruct,
    record(CaipAssetTypeStruct, nullable(AssetMarketDataStruct)),
  ),
});
