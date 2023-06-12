/**
 * The parameters for calling the `getPublicKey` JSON-RPC method.
 *
 * Note: For simplicity, these are not validated by the snap. In production, you
 * should validate that the request object matches this type before using it.
 */
export type GetBip32PublicKeyParams = {
  /**
   * The BIP-32 path to the account.
   */
  path: ['m', ...(`${number}` | `${number}'`)[]];

  /**
   * The curve used to derive the account.
   */
  curve: 'secp256k1' | 'ed25519';

  /**
   * Whether to return the public key in compressed form.
   */
  compressed?: boolean | undefined;

  /**
   * Miscellaneous parameters, which are passed to `snap_getBip32PublicKey`.
   */
  [key: string]: unknown;
};

/**
 * The parameters for calling the `signMessage` JSON-RPC method.
 *
 * Note: For simplicity, these are not validated by the snap. In production, you
 * should validate that the request object matches this type before using it.
 */
export type SignMessageParams = {
  /**
   * The message to sign.
   */
  message: string;

  /**
   * The BIP-32 path to the account.
   */
  path: string[];

  /**
   * The curve used to derive the account.
   */
  curve: 'secp256k1' | 'ed25519';
};
