import { deriveBIP44AddressKey } from '@metamask/key-tree';
import { assert, remove0x } from '@metamask/utils';

import type { GetAccountParams } from './types';

/**
 * Get a BIP-44 private key, using the `snap_getBip44Entropy` method.
 *
 * @param params - The parameters for getting the BIP-44 private key. These are
 * passed directly to the method, and are not validated beforehand.
 * @param params.coinType - The coin type to get the account for. This must be
 * one of the coin types registered in the snap manifest. If this is not
 * specified, it defaults to the Bitcoin coin type (1).
 * @param params.addressIndex - The address index to get the account for. If
 * this is not specified, it defaults to the first address (`address_index` = 0).
 * @returns A private key, as a hexadecimal string, without the leading `0x`.
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_getbip44entropy
 */
export const getPrivateKey = async ({
  coinType = 1,
  addressIndex = 0,
}: GetAccountParams = {}) => {
  // `snap_getBip44Entropy` returns a `JsonBIP44CoinTypeNode` object, which can
  // be used with the `deriveBIP44AddressKey` function from `@metamask/key-tree`
  // to derive the private key for a BIP-44 address.
  const coinTypeNode = await snap.request({
    method: 'snap_getBip44Entropy',
    params: {
      coinType,
    },
  });

  const node = await deriveBIP44AddressKey(coinTypeNode, {
    account: 0,
    change: 0,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    address_index: addressIndex,
  });

  // The node is guaranteed to have a private key, but TypeScript isn't aware of
  // that, so we assert that it exists.
  assert(node.privateKey);

  return remove0x(node.privateKey);
};
