import type { JsonBIP44CoinTypeNode } from '@metamask/key-tree';

import type { Bip44Entropy } from '../permissions';

/**
 * An object containing the parameters for the `snap_getBip44Entropy` method.
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
 * A JSON-serializable BIP-44 coin type node containing the requested BIP-44
 * entropy.
 */
export type GetBip44EntropyResult = JsonBIP44CoinTypeNode;
