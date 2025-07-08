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
  CaipAssetTypeOrIdStruct,
  assert,
  isObject,
} from '@metamask/utils';
import type { CaipAssetTypeOrId } from '@metamask/utils';

import { selectiveUnion } from '../../internals';

export const FungibleAssetUnitStruct = object({
  name: optional(string()),
  symbol: optional(string()),
  decimals: number(),
});

/**
 * A unit of a fungible asset, which can be used to represent
 * different denominations of the asset.
 *
 * @property name - The name of the unit, if available.
 * @property symbol - The symbol of the unit, if available.
 * @property decimals - The number of decimal places for the unit.
 */
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

/**
 * A struct representing the metadata for a fungible asset.
 *
 * @property name - The name of the asset, if available.
 * @property symbol - The symbol of the asset, if available.
 * @property fungible - Indicates that this is a fungible asset. This is always `
 * true` for fungible assets.
 * @property iconUrl - The URL of the asset's icon, which can be a base64 SVG or a remote HTTPS URL.
 * @property units - An array of units for the asset, each represented by {@link FungibleAssetUnitStruct}.
 */
export const FungibleAssetMetadataStruct = object({
  name: optional(string()),
  symbol: optional(string()),
  fungible: literal(true),
  iconUrl: AssetIconUrlStruct,
  units: size(array(FungibleAssetUnitStruct), 1, Infinity),
});

/**
 * A collection of non-fungible assets, which can be used to group
 * assets that share a common theme or creator.
 *
 * @property name - The name of the collection.
 * @property address - The CAIP-10 account ID of the collection's creator.
 * @property symbol - The symbol of the collection.
 * @property tokenCount - The number of tokens in the collection, if available.
 * @property creator - The CAIP-10 account ID of the collection's creator, if
 * available.
 * @property imageUrl - The URL of the collection's image.
 */
export const NonFungibleAssetCollectionStruct = object({
  name: string(),
  address: CaipAccountIdStruct,
  symbol: string(),
  tokenCount: optional(number()),
  creator: optional(CaipAccountIdStruct),
  imageUrl: optional(AssetIconUrlStruct),
});

/**
 * A collection of non-fungible assets, which can be used to group
 * assets that share a common theme or creator.
 *
 * @property name - The name of the collection.
 * @property address - The CAIP-10 account ID of the collection's creator.
 * @property symbol - The symbol of the collection.
 * @property tokenCount - The number of tokens in the collection, if available.
 * @property creator - The CAIP-10 account ID of the collection's creator, if
 * available.
 * @property imageUrl - The URL of the collection's image.
 */
export type NonFungibleAssetCollection = Infer<
  typeof NonFungibleAssetCollectionStruct
>;

/**
 * A struct representing the metadata for a non-fungible asset.
 *
 * @property fungible - Indicates that this is a non-fungible asset.
 * This is always `false` for non-fungible assets.
 * @property name - The name of the asset, if available.
 * @property symbol - The symbol of the asset, if available.
 * @property imageUrl - The URL of the asset's image, which can be a base64 SVG or a remote HTTPS URL.
 * @property description - A description of the asset, if available.
 * @property acquiredAt - The timestamp when the asset was acquired, if available.
 * @property isPossibleSpam - Indicates if the asset is possibly spam, if available.
 * @property attributes - Additional attributes of the asset, represented as a record of string keys and
 * string or number values.
 * @property collection - The collection the asset belongs to, if available. See {@link NonFungibleAssetCollectionStruct}.
 */
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

/**
 * A struct representing the metadata for an asset, which can be either
 * {@link FungibleAssetMetadataStruct} or {@link NonFungibleAssetMetadataStruct}.
 */
export const AssetMetadataStruct = selectiveUnion((metadata) => {
  if (isObject(metadata) && metadata.fungible) {
    return FungibleAssetMetadataStruct;
  }

  return NonFungibleAssetMetadataStruct;
});

/**
 * A struct representing the response of the `onAssetsLookup` method.
 *
 * @property assets - An object containing a mapping between the CAIP-19 key and a metadata object or null.
 */
export const OnAssetsLookupResponseStruct = object({
  assets: record(CaipAssetTypeOrIdStruct, nullable(AssetMetadataStruct)),
});

/**
 * The metadata for an asset, which can be either fungible or non-fungible.
 *
 */
export type AssetMetadata = Infer<typeof AssetMetadataStruct>;

/**
 * The metadata for a fungible asset.
 *
 * @property fungible - Indicates that this is a fungible asset.
 * This is always `true` for fungible assets.
 * @property name - The name of the asset.
 * @property symbol - The symbol of the asset.
 * @property iconUrl - The URL of the asset's icon.
 * @property units - An array of units for the asset, each represented by {@link FungibleAssetUnit}.
 */
export type FungibleAssetMetadata = Infer<typeof FungibleAssetMetadataStruct>;

/**
 * The metadata for a non-fungible asset.
 *
 * @property fungible - Indicates that this is a non-fungible asset.
 * This is always `false` for non-fungible assets.
 * @property name - The name of the asset.
 * @property symbol - The symbol of the asset.
 * @property imageUrl - The URL of the asset's image.
 * @property description - A description of the asset.
 * @property acquiredAt - The timestamp when the asset was acquired, if available.
 * @property isPossibleSpam - Indicates if the asset is possibly spam, if available.
 * @property attributes - Additional attributes of the asset, represented as a record of string keys and
 * string or number values.
 * @property collection - The collection the asset belongs to, if available. See {@link NonFungibleAssetCollection}.
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
  assets: Record<CaipAssetTypeOrId, AssetMetadata | null>;
};
