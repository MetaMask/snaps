import {
  array,
  nullable,
  number,
  object,
  optional,
  string,
  tuple,
} from '@metamask/superstruct';

import { nonEmptyRecord } from './structs';
import { Iso8601DurationStruct } from './time';

/**
 * A struct representing a historical price.
 */
export const HistoricalPriceStruct = nonEmptyRecord(
  Iso8601DurationStruct,
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
