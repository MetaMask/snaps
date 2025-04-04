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
} from '@metamask/superstruct';
import {
  assert,
  CaipAssetTypeStruct,
  type CaipAssetType,
} from '@metamask/utils';

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

export const OnAssetsLookupResponseStruct = object({
  assets: record(CaipAssetTypeStruct, nullable(FungibleAssetMetadataStruct)),
});

export type FungibleAssetMetadata = Infer<typeof FungibleAssetMetadataStruct>;

export type OnAssetsLookupArguments = {
  assets: CaipAssetType[];
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
  assets: Record<CaipAssetType, FungibleAssetMetadata | null>;
};
