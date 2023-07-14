import type { PartialHDPathTuple5 } from '@metamask/key-tree';

/**
 * A BIP-44 path is of the form:
 *
 * `m / 44' / coin_type' / account' / change / address_index`
 *
 * This type represents the last 5 elements of the path in the form of a tuple.
 */
export type BIP44Path = PartialHDPathTuple5;

/**
 * The parameters for the `signMessage` JSON-RPC method.
 */
export type SignMessageParams = {
  /**
   * The message to sign.
   */
  message: string;

  /**
   * The derivation path to derive the account from. If not provided, the
   * default derivation path for Ethereum is used.
   */
  path?: BIP44Path;
};
