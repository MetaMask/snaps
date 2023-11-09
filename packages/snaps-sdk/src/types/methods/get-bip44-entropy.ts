import type { JsonBIP44CoinTypeNode } from '@metamask/key-tree';

import type { Bip44Entropy } from '../permissions';

/**
 * The request parameters for the `snap_getBip44Entropy` method.
 *
 * @property coinType - The BIP-44 coin type to derive the entropy from.
 */
export type GetBip44EntropyParams = Bip44Entropy;

/**
 * The result returned by the `snap_getBip44Entropy` method.
 *
 * @see https://github.com/MetaMask/key-tree#usage
 */
export type GetBip44EntropyResult = JsonBIP44CoinTypeNode;
