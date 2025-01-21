import type { Infer } from '@metamask/superstruct';
import {
  array,
  boolean,
  literal,
  number,
  object,
  refine,
  string,
} from '@metamask/superstruct';
import { assert, type CaipAssetType } from '@metamask/utils';

export const FungibleAssetUnitStruct = object({
  name: string(),
  symbol: string(),
  decimals: number(),
});

export type FungibleAssetUnit = Infer<typeof FungibleAssetUnitStruct>;

export const AssetIconUrlStruct = refine(string(), 'Asset URL', (value) => {
  try {
    const url = new URL(value);
    assert(url.protocol === 'https:');
    return true;
  } catch {
    return 'Invalid URL';
  }
});

export const FungibleAssetMetadataStruct = object({
  name: string(),
  symbol: string(),
  native: boolean(),
  fungible: literal(true),
  iconUrl: AssetIconUrlStruct,
  units: array(FungibleAssetUnitStruct),
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
 * @property assets - An object containing a mapping between the CAIP-19 key and a metadata object.
 */
export type OnAssetsLookupResponse = {
  assets: Record<CaipAssetType, FungibleAssetMetadata>;
};
