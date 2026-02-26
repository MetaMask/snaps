import type { JsonSLIP10Node } from '@metamask/key-tree';

import type { Bip32Entropy } from '../permissions';

/**
 * An object containing the parameters for the `snap_getBip32Entropy` method.
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
 * A JSON-serializable SLIP-10 node containing the requested BIP-32 entropy.
 */
export type GetBip32EntropyResult = JsonSLIP10Node;
