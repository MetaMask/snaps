# `@metamask/consumer-signer-example-snap`

This Snap demonstrates how to use the `wallet_invokeSnap` method to invoke
another Snap. In this case, we invoke the core signer Snap to sign a message
using a private key derived from generated entropy.

For simplicity, the Snap does not actually sign Ethereum-compatible messages. It
uses Ethereum's BIP-44 derivation path, to demonstrate how to use the
`wallet_invokeSnap` method to use another snap's functionality.

## Snap usage

This Snap exposes an `onRpcRequest` handler, which supports the following
JSON-RPC methods:

- `signMessage`: Get an account from the core signer Snap, and sign a message
  using the account's private key.
