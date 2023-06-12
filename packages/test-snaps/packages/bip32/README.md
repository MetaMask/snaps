# `@metamask/bip32-example-snap`

This snap demonstrates the use of `snap_getBip32Entropy` and
`snap_getBip32PublicKey` to derive a BIP-32 public key and private key from the
user's secret recovery phrase.

> **Note**: Using `snap_getBip32Entropy` and `snap_getBip32PublicKey`
> requires their respective `snap_getBip32Entropy` and `snap_getBip32PublicKey`
> permissions. Refer to [the documentation](https://docs.metamask.io/snaps/reference/rpc-api/#snap_getbip32entropy)
> for more information.

For more information, you can refer to
[the end-to-end tests](./src/index.test.ts).
