import type { JsonSLIP10Node } from '@metamask/key-tree';

import type { Bip32Entropy } from '../permissions';

/**
 * The request parameters for the `snap_getBip32Entropy` method.
 */
export type GetBip32EntropyParams = Bip32Entropy & {
  /**
   * The ID of the entropy source to use. If not specified, the primary entropy
   * source will be used. For a list of available entropy sources, see the
   * `snap_listEntropySources` method.
   */
  source?: string | undefined;
};

/**
 * The result returned by the `snap_getBip32Entropy` method.
 *
 * @see https://github.com/MetaMask/key-tree#usage
 */
export type GetBip32EntropyResult = JsonSLIP10Node;
