import type { JsonBIP44CoinTypeNode } from '@metamask/key-tree';

import type { Bip44Entropy } from '../permissions';

/**
 * The request parameters for the `snap_getBip44Entropy` method.
 */
export type GetBip44EntropyParams = Bip44Entropy & {
  /**
   * The ID of the entropy source to use. If not specified, the primary entropy
   * source will be used. For a list of available entropy sources, see the
   * `snap_listEntropySources` method.
   */
  source?: string | undefined;
};

/**
 * The result returned by the `snap_getBip44Entropy` method.
 *
 * @see https://github.com/MetaMask/key-tree#usage
 */
export type GetBip44EntropyResult = JsonBIP44CoinTypeNode;
