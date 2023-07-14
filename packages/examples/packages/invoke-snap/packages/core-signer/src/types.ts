import type { PartialHDPathTuple5 } from '@metamask/key-tree';
import type { Hex } from '@metamask/utils';

/**
 * A BIP-44 path is of the form:
 *
 * `m / 44' / coin_type' / account' / change / address_index`
 *
 * This type represents the last 5 elements of the path in the form of a tuple.
 */
export type BIP44Path = PartialHDPathTuple5;

/**
 * A derived account object, containing the public key and derivation path. This
 * can be used to sign messages and transactions.
 */
export type Account = {
  /**
   * The public key for the account, in hexadecimal format.
   */
  publicKey: Hex;

  /**
   * The derivation path for the account.
   */
  path: BIP44Path;
};

export type GetAccountParams = {
  /**
   * The derivation path for the account.
   */
  path: BIP44Path;
};

/**
 * The parameters for the `signMessage` JSON-RPC method.
 */
export type SignMessageParams = {
  /**
   * The message to sign in hexadecimal format. The core signer has no knowledge
   * of the actual message that is being signed, so this can be a transaction,
   * message, etc.
   */
  message: Hex;

  /**
   * The {@link Account} to sign the message with.
   */
  account: Account;
};
