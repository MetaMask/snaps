# `@metamask/get-locale-example-snap`

This snap demonstrates how to use `snap_getLocale` JSON-RPC method to get
the currently selected user locale from the MetaMask extension, and use it in a snap.

## Snap manifest

> **Note**: Using `snap_getLocale` requires the `snap_getLocale`
> permissions. Refer to [the documentation](https://docs.metamask.io/snaps/reference/rpc-api/#snap_getlocale)
> for more information.

Along with other permissions, the manifest of this snap includes the
`snap_getLocale` permission:

```json
{
  "initialPermissions": {
    "snap_getLocale": {}
  }
}
```

This permission does not require any additional configuration.

## Snap usage

This snap exposes an `onRpcRequest` handler, which supports the following
JSON-RPC methods:

- `hello`: Shows an alert dialog with a localized message, using both `snap_dialog`
  and `snap_getLocale`.

For more information, you can refer to
[the end-to-end tests](./src/index.test.ts).
