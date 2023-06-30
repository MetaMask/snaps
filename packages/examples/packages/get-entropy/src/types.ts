/**
 * The parameters for the `signMessage` JSON-RPC method.
 */
export type SignMessageParams = {
  /**
   * The message to sign.
   */
  message: string;

  /**
   * The salt to use for the entropy derivation. Using a different salt will
   * result in completely different entropy being generated, and thus a
   * completely different signature.
   *
   * Defaults to "Signing key".
   */
  salt?: string;
};
