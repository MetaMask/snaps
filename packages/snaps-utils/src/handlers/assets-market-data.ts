import { nonEmptyRecord } from '@metamask/snaps-sdk';
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
import { CaipAssetTypeStruct } from '@metamask/utils';

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
 * A struct representing the response of the `onAssetsMarketData` method.
 */
export const OnAssetsMarketDataResponseStruct = object({
  marketData: record(
    CaipAssetTypeStruct,
    record(CaipAssetTypeStruct, nullable(FungibleAssetMarketDataStruct)),
  ),
});
