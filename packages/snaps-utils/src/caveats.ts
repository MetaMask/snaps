export enum SnapCaveatType {
  /**
   * Permitted derivation paths, used by `snap_getBip32Entropy`.
   */
  PermittedDerivationPaths = 'permittedDerivationPaths',

  /**
   * Permitted coin types, used by `snap_getBip44Entropy`.
   */
  PermittedCoinTypes = 'permittedCoinTypes',

  /**
   * Permission to use the Snap keyring API.
   */
  SnapKeyring = 'snapKeyring',

  /**
   * Caveat specifying a snap cronjob.
   */
  SnapCronjob = 'snapCronjob',

  /**
   * Caveat specifying access to the transaction origin, used by `endowment:transaction-insight`.
   */
  TransactionOrigin = 'transactionOrigin',

  /**
   * The origins that a Snap can receive JSON-RPC messages from.
   */
  RpcOrigin = 'rpcOrigin',

  /**
   * Caveat specifying the snap IDs that can be interacted with.
   */
  SnapIds = 'snapIds',
}
