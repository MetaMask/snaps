/**
 * The parameters for the `signMessage` JSON-RPC method.
 */
export type SignMessageParams = {
  /**
   * The message to sign. It will be signed using the snap's signing key,
   * derived with the [`snap_getEntropy`](https://docs.metamask.io/snaps/reference/rpc-api/#snap_getentropy)
   * method.
   */
  message: string;
};
