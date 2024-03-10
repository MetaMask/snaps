# `@metamask/dialog-example-snap`

This snap demonstrates the use of `snap_dialog` to display a dialog to the user.

## Snap manifest

> **Note**: Using `snap_dialog` requires the `snap_dialog` permission. Refer to
> [the documentation](https://docs.metamask.io/snaps/reference/rpc-api/#snap_dialog)
> for more information.

Along with other permissions, the manifest of this snap includes the
`snap_dialog` permission:

```json
{
  "initialPermissions": {
    "snap_dialog": {}
  }
}
```

This permission does not require any additional configuration.

## Snap usage

This snap exposes an `onRpcRequest` handler, which supports the following
JSON-RPC methods, one for each type of dialog:

- `showAlert`: Displays an alert dialog to the user.
- `showConfirmation`: Displays a confirmation dialog to the user.
- `showPrompt`: Displays a prompt dialog to the user.

For the sake of simplicity, the methods do not accept any parameters, and
return the value returned by `snap_dialog` directly.

For more information, you can refer to
[the end-to-end tests](./src/index.test.ts).
