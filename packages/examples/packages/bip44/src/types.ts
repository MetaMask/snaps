/**
 * The parameters for calling the `getAccount` JSON-RPC method.
 */
export type GetAccountParams = {
  /**
   * The coin type to get the account for. This must be one of the coin types
   * registered in the snap manifest. If this is not specified, it defaults to
   * the Bitcoin coin type (1).
   */
  coinType?: number;

  /**
   * The address index to get the account for. If this is not specified, it
   * defaults to the first address (`address_index` = 0).
   */
  addressIndex?: number;
};

/**
 * The parameters for calling the `signMessage` JSON-RPC method.
 */
export type SignMessageParams = GetAccountParams & {
  /**
   * The message to sign.
   */
  message: string;
};
