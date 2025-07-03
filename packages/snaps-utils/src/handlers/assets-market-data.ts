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
import { CaipAssetTypeOrIdStruct, CaipAssetTypeStruct } from '@metamask/utils';

import { ISO8601DurationStruct } from '../time';

/**
 * A struct representing the market data for an asset.
 */
export const PricePercentChangeStruct = nonEmptyRecord(
  union([literal('all'), ISO8601DurationStruct]),
  number(),
);

/**
 * A struct representing the market data for an asset.
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
 * A struct representing the metadata for a fungible asset.
 */
export const AssetValueStruct = object({
  asset: CaipAssetTypeOrIdStruct,
  amount: string(),
});

/**
 * A struct representing the market data for a non-fungible asset.
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
 * A struct representing the market data for an asset, which can be either fungible or non-fungible.
 */
export const AssetMarketDataStruct = selectiveUnion((marketData) => {
  if (marketData.fungible) {
    return FungibleAssetMarketDataStruct;
  }

  return NonFungibleAssetMarketDataStruct;
});

/**
 * A struct representing the response of the `onAssetsMarketData` method.
 */
export const OnAssetsMarketDataResponseStruct = object({
  marketData: record(
    CaipAssetTypeOrIdStruct,
    record(CaipAssetTypeStruct, nullable(AssetMarketDataStruct)),
  ),
});
