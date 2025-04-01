import type { CaipAssetType } from '@metamask/utils';

/**
 * The historical price value.
 * The first element in the array is the timestamp, the second is the price.
 */
export type HistoricalPriceValue = [number, string];

/**
 * The historical price object.
 * The key is the time period as an ISO 8601 duration, the value is an array of historical price values.
 */
export type HistoricalPriceIntervals = {
  [key: string]: HistoricalPriceValue[];
};

/**
 * The response from the historical price query, containing the historical price about the requested asset pair.
 *
 * @property historicalPrice - The historical price object
 * @property historicalPrice.intervals - The historical price of the asset pair.
 * @property historicalPrice.updateTime - The time at which the historical price has been calculated.
 * @property historicalPrice.expirationTime - The time at which the historical price expires.
 */
export type OnAssetHistoricalPriceResponse = {
  historicalPrice: {
    intervals: HistoricalPriceIntervals;
    updateTime: number;
    expirationTime?: number;
  };
} | null;

/**
 * The `onAssetHistoricalPrice` handler arguments.
 *
 * @property from - The CAIP-19 asset type of the asset requested.
 * @property to - The CAIP-19 asset type of the asset converted to.
 */
export type OnAssetHistoricalPriceArguments = {
  from: CaipAssetType;
  to: CaipAssetType;
};

/**
 * The `onAssetHistoricalPrice` handler. This is called by MetaMask when querying about historical price of an asset pair on specific chains.
 *
 * @returns The historical price of the asset pair. See
 * {@link OnAssetHistoricalPriceResponse}.
 */
export type OnAssetHistoricalPriceHandler = (
  args: OnAssetHistoricalPriceArguments,
) => Promise<OnAssetHistoricalPriceResponse>;
