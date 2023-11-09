import type { JsonSLIP10Node } from '@metamask/key-tree';

import type { Bip32Entropy } from '../permissions';

/**
 * The request parameters for the `snap_getBip32Entropy` method.
 *
 * @property path - The BIP-32 path to derive the entropy from.
 * @property curve - The curve to use when deriving the entropy.
 */
export type GetBip32EntropyParams = Bip32Entropy;

/**
 * The result returned by the `snap_getBip32Entropy` method.
 *
 * @see https://github.com/MetaMask/key-tree#usage
 */
export type GetBip32EntropyResult = JsonSLIP10Node;
