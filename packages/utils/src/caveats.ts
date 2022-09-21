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
}
