import {
  nullable,
  number,
  object,
  optional,
  record,
  string,
} from '@metamask/superstruct';
import { CaipAssetTypeStruct } from '@metamask/utils';

/**
 * A struct representing the conversion rate between two assets.
 */
export const AssetConversionStruct = object({
  rate: string(),
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
