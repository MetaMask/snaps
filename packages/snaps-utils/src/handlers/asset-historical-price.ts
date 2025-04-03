import { nonEmptyRecord } from '@metamask/snaps-sdk';
import {
  array,
  literal,
  nullable,
  number,
  object,
  optional,
  string,
  tuple,
  union,
} from '@metamask/superstruct';

import { ISO8601DurationStruct } from '../time';

/**
 * A struct representing a historical price.
 */
export const HistoricalPriceStruct = nonEmptyRecord(
  union([literal('all'), ISO8601DurationStruct]),
  array(tuple([number(), string()])),
);

/**
 * A struct representing an asset's historical price.
 */
export const AssetHistoricalPriceStruct = nullable(
  object({
    intervals: HistoricalPriceStruct,
    updateTime: number(),
    expirationTime: optional(number()),
  }),
);

/**
 * A struct representing the response of the `onAssetHistoricalPrice` method.
 */
export const OnAssetHistoricalPriceResponseStruct = object({
  historicalPrice: AssetHistoricalPriceStruct,
});
