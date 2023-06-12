# `@metamask/bip44-example-snap`

This snap demonstrates the use of `snap_getBip44Entropy` to derive a BIP-44
private key from the user's secret recovery phrase.

## Snap manifest

> **Note**: Using `snap_getBip44Entropy` requires the `snap_getBip44Entropy`
> permissions. Refer to [the documentation](https://docs.metamask.io/snaps/reference/rpc-api/#snap_getbip44entropy)
> for more information.

Along with other permissions, the manifest of this snap includes the
`snap_getBip44Entropy` permission:

```json
{
  "initialPermissions": {
    "snap_getBip44Entropy": [
      {
        "coinType": 1
      },
      {
        "coinType": 3
      }
    ]
  }
}
```

Each of the coin types in the `initialPermissions.snap_getBip44Entropy` array
represents a BIP-44 coin type. The coin types in the array above represent
Bitcoin and Dogecoin, respectively. All coin types can be found in the SLIP-44
registry [here](https://github.com/satoshilabs/slips/blob/master/slip-0044.md).

## Snap usage

This snap exposes an `onRpcRequest` handler, which supports the following
JSON-RPC methods:

- `getPublicKey`: Get the public key for the given `coinType` and
  `addressIndex`.
- `signMessage`: Sign a `message` with the private key for the given `coinType`
  and `addressIndex`. For this particular example, we use the `BLS12-381`
  elliptic curve to sign the message.

For more information, you can refer to
[the end-to-end tests](./src/index.test.ts).
