import type { CaipAssetType } from '@metamask/utils';

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
  assets: Record<CaipAssetType, any>;
};
