# `@metamask/invoke-snap-example-snap`

These snaps demonstrate how to use the `wallet_invokeSnap` JSON-RPC method
to call a snap from within another snap.

This directory is not a standalone package, but rather a collection of snaps
using the `wallet_invokeSnap` method to call each other. It consists of two
snaps:

- [**`packages/core-signer`**](./packages/core-signer): A snap that generates
  entropy using the WebCrypto API, and uses it to derive a key pair. It exposes
  the public key and signs messages using the private key.
- [**`packages/consumer-signer`**](./packages/consumer-signer): A snap that
  signs messages using an Ethereum private key. The Ethereum public key is
  requested from the core signer snap, using the `wallet_invokeSnap` method, and
  it uses the `signMessage` method of the core signer snap to sign messages.

## Snap manifest

> **Note**: Calling snaps from other snaps requires the `endowment:rpc`
> permission, with the `snaps` option set to `true`.

Along with other permissions, the core signer snap in this example has the
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

The other snap in this example does not have any special permissions, as it is
not called from other snaps.

## Caveats

- The `wallet_invokeSnap` method does not install a snap. It only calls a snap
  that is already installed. If the snap is not installed, the method will
  return an error.
  - Right now there is no way to install a snap from within another snap. This
    is a limitation of the current implementation of the `wallet_invokeSnap`
    method.
