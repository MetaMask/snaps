import type { Infer } from '@metamask/superstruct';
import {
  number,
  object,
  string,
  optional,
  record,
  nullable,
} from '@metamask/superstruct';
import { CaipAssetTypeStruct, type CaipAssetType } from '@metamask/utils';

export const AssetConversionStruct = object({
  rate: string(),
  conversionTime: number(),
  expirationTime: optional(number()),
});

export const OnAssetsConversionResponseStruct = object({
  conversionRates: record(
    CaipAssetTypeStruct,
    record(CaipAssetTypeStruct, nullable(AssetConversionStruct)),
  ),
});

export type AssetConversion = Infer<typeof AssetConversionStruct>;

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
 * @property conversionRates - A nested object with two CAIP-19 keys that contains a conversion rate or null between the two keys.
 */
export type OnAssetsConversionResponse = {
  conversionRates: Record<
    CaipAssetType,
    Record<CaipAssetType, AssetConversion | null>
  >;
};
