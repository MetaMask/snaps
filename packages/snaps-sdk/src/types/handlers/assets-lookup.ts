import type { Infer } from '@metamask/superstruct';
import {
  array,
  size,
  literal,
  number,
  object,
  refine,
  string,
  record,
  nullable,
  optional,
  boolean,
  union,
} from '@metamask/superstruct';
import {
  CaipAccountIdStruct,
  CaipAssetTypeStruct,
  assert,
} from '@metamask/utils';
import type { CaipAssetTypeOrId, CaipAssetType } from '@metamask/utils';

export const FungibleAssetUnitStruct = object({
  name: optional(string()),
  symbol: optional(string()),
  decimals: number(),
});

export type FungibleAssetUnit = Infer<typeof FungibleAssetUnitStruct>;

export const AssetIconUrlStruct = refine(string(), 'Asset URL', (value) => {
  try {
    const url = new URL(value);
    // For now, we require asset URLs to either be base64 SVGs or remote HTTPS URLs
    assert(
      url.protocol === 'https:' ||
        value.startsWith('data:image/svg+xml;base64,'),
    );
    return true;
  } catch {
    return 'Invalid URL';
  }
});

export const FungibleAssetMetadataStruct = object({
  name: optional(string()),
  symbol: optional(string()),
  fungible: literal(true),
  iconUrl: AssetIconUrlStruct,
  units: size(array(FungibleAssetUnitStruct), 1, Infinity),
});

export const NonFungibleAssetCollectionStruct = object({
  name: string(),
  address: CaipAccountIdStruct,
  symbol: string(),
  tokenCount: optional(number()),
  creator: optional(CaipAccountIdStruct),
  imageUrl: optional(AssetIconUrlStruct),
});

export type NonFungibleAssetCollection = Infer<
  typeof NonFungibleAssetCollectionStruct
>;

export const NonFungibleAssetMetadataStruct = object({
  fungible: literal(false),
  name: optional(string()),
  symbol: optional(string()),
  imageUrl: optional(AssetIconUrlStruct),
  description: optional(string()),
  acquiredAt: optional(number()),
  isPossibleSpam: optional(boolean()),
  attributes: optional(record(string(), union([string(), number()]))),
  collection: optional(NonFungibleAssetCollectionStruct),
});

export const AssetMetadataStruct = union([
  FungibleAssetMetadataStruct,
  NonFungibleAssetMetadataStruct,
]);

export const OnAssetsLookupResponseStruct = object({
  assets: record(CaipAssetTypeStruct, nullable(AssetMetadataStruct)),
});

/**
 * The metadata for an asset, which can be either fungible or non-fungible.
 */
export type AssetMetadata = Infer<typeof AssetMetadataStruct>;

/**
 * The metadata for a fungible asset.
 */
export type FungibleAssetMetadata = Infer<typeof FungibleAssetMetadataStruct>;

/**
 * The metadata for a non-fungible asset.
 */
export type NonFungibleAssetMetadata = Infer<
  typeof NonFungibleAssetMetadataStruct
>;

/**
 * The arguments for the `onAssetsLookup` handler.
 *
 * @property assets - An array of CAIP-19 asset types to look up.
 */
export type OnAssetsLookupArguments = {
  assets: CaipAssetTypeOrId[];
};

/**
 * The `onAssetsLookup` handler. This is called by MetaMask when querying about specific assets on specific chains.
 *
 * @returns The metadata about each asset. See
 * {@link OnAssetsLookupResponse}.
 */
export type OnAssetsLookupHandler = (
  args: OnAssetsLookupArguments,
) => Promise<OnAssetsLookupResponse>;

/**
 * The response from the query, containing metadata about each requested asset.
 *
 * @property assets - An object containing a mapping between the CAIP-19 key and a metadata object or null.
 */
export type OnAssetsLookupResponse = {
  assets: Record<CaipAssetType, AssetMetadata | null>;
};
