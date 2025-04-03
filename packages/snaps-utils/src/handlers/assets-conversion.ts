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
export const MarketDataStruct = object({
  marketCap: string(),
  totalVolume: string(),
  circulatingSupply: string(),
  allTimeHigh: string(),
  allTimeLow: string(),
  pricePercentChange: optional(PricePercentChangeStruct),
});

/**
 * A struct representing the conversion rate between two assets.
 */
export const AssetConversionStruct = object({
  rate: string(),
  marketData: optional(MarketDataStruct),
  conversionTime: number(),
  expirationTime: optional(number()),
});

/**
 * A struct representing the response of the `onAssetsConversion` method.
 */
export const OnAssetsConversionResponseStruct = object({
  conversionRates: record(
    CaipAssetTypeStruct,
    record(CaipAssetTypeStruct, nullable(AssetConversionStruct)),
  ),
});
