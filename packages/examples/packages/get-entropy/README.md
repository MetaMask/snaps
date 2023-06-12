# `@metamask/get-entropy-example-snap`

This snap demonstrates how to use `snap_getEntropy` JSON-RPC method to get
entropy from the MetaMask extension, and use it to sign a message.

## Snap manifest

> **Note**: Using `snap_getEntropy` requires the `snap_getEntropy`
> permissions. Refer to [the documentation](https://docs.metamask.io/snaps/reference/rpc-api/#snap_getentropy)
> for more information.

Along with other permissions, the manifest of this snap includes the
`snap_getEntropy` permission:

```json
{
  "initialPermissions": {
    "snap_getEntropy": {}
  }
}
```

This permission does not require any additional configuration.

## Snap usage

This snap exposes an `onRpcRequest` handler, which supports the following
JSON-RPC methods:

- `signMessage`: Derives a private key using the `snap_getEntropy` method, and
  uses it to sign a `message`. For this particular example, we use the
  `BLS12-381` elliptic curve to sign the message.

For more information, you can refer to
[the end-to-end tests](./src/index.test.ts).
