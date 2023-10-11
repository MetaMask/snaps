# `@metamask/invoke-snap-example-snap`

These Snaps demonstrate how to use the `wallet_invokeSnap` JSON-RPC method
to call a Snap from within another Snap.

This directory is not a standalone package, but rather a collection of Snaps
using the `wallet_invokeSnap` method to call each other. It consists of two
Snaps:

- [**`packages/core-signer`**](./packages/core-signer): A Snap that generates
  entropy using the WebCrypto API, and uses it to derive a key pair. It exposes
  the public key and signs messages using the private key.
- [**`packages/consumer-signer`**](./packages/consumer-signer): A Snap that
  signs messages using an Ethereum private key. The Ethereum public key is
  requested from the core signer Snap, using the `wallet_invokeSnap` method, and
  it uses the `signMessage` method of the core signer Snap to sign messages.

## Snap manifest

> **Note**: Calling Snaps from other Snaps requires the `endowment:rpc`
> permission, with the `snaps` option set to `true`.

Along with other permissions, the core signer Snap in this example has the
`endowment:rpc` permission with the `snaps` option set to `true`.

```json
{
  "initialPermissions": {
    "endowment:rpc": {
      "snaps": true
    }
  }
}
```

The other Snap in this example does not have any special permissions, as it is
not called from other Snaps.

## Caveats

- The `wallet_invokeSnap` method does not install a Snap. It only calls a Snap
  that is already installed. If the Snap is not installed, the method will
  return an error.
  - Right now there is no way to install a Snap from within another Snap. This
    is a limitation of the current implementation of the `wallet_invokeSnap`
    method.
