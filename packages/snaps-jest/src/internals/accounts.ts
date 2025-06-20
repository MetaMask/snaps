import type { CaipAssetType, CaipChainId } from '@metamask/utils';
import { parseCaipAssetType } from '@metamask/utils';
import { createHash } from 'crypto';

/**
 * Get a function that generates pseudo-random UUIDs. This function uses a
 * counter to generate a unique UUID each time it is called.
 *
 * This is likely not suitable for production use, as it does not guarantee
 * true randomness and is not cryptographically secure. It is intended for
 * testing and mock purposes only.
 *
 * @returns A function that generates a pseudo-random UUID.
 */
export function getPseudoRandomUuidGenerator() {
  let counter = 0;

  return () => {
    const bytes = createHash('sha256')
      .update(`${counter}`)
      .digest()
      .subarray(0, 16);

    /* eslint-disable no-bitwise */
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    /* eslint-enable no-bitwise */

    counter += 1;

    return (
      bytes
        .toString('hex')
        .match(/.{1,8}/gu)
        ?.join('-') ?? ''
    );
  };
}

/**
 * Get unique scopes from a list of assets. This assumes the assets are in
 * CAIP format, where the chain ID is the first part of the asset type.
 *
 * @param assets - An array of CAIP asset types.
 * @returns An array of unique CAIP chain IDs derived from the assets.
 */
export function getScopesFromAssets(
  assets: CaipAssetType[] = [],
): CaipChainId[] {
  const scopes = assets.map((asset) => {
    const { chainId } = parseCaipAssetType(asset);
    return chainId;
  });

  return Array.from(new Set(scopes));
}
