# `@metamask/json-rpc-example-snap`

This snap demonstrates how to use `wallet_invokeSnap` JSON-RPC method to invoke
a snap from another snap.

## Snap manifest

> **Note**: Using `wallet_invokeSnap` requires the `wallet_snap`
> permissions. Refer to [the documentation](https://docs.metamask.io/snaps/reference/rpc-api/#wallet_snap)
> for more information.

Along with other permissions, the manifest of this snap includes the
`wallet_snap` permission:

```json
{
  "initialPermissions": {
    "wallet_snap": {
      "npm:@metamask/bip32-example-snap": {
        "version": "0.34.1-flask.1"
      }
    }
  }
}
```

This is required for the snap to be able to invoke the
`@metamask/bip32-example-snap` snap.

## Snap usage

This snap exposes an `onRpcRequest` handler, which supports the following
JSON-RPC methods:

- `invokeSnap`: Call the `getPublicKey` method of the
  `@metamask/bip32-example-snap`, and return the response. This demonstrates
  that a snap can invoke another snap through the `wallet_invokeSnap` method.
  Note that the `@metamask/bip32-example-snap` must be installed in the
  extension, and it must have the `endowment:rpc` permission, with the "snaps"
  option enabled.

For more information, you can refer to
[the end-to-end tests](./src/index.test.ts).
