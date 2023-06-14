# `@metamask/notifications-example-snap`

This snap demonstrates how to use `snap_notify` to send in-app and desktop
notifications to the user.

## Snap manifest

> **Note**: Using `snap_notify` requires the `snap_notify`
> permissions. Refer to [the documentation](https://docs.metamask.io/snaps/reference/rpc-api/#snap_notify)
> for more information.

Along with other permissions, the manifest of this snap includes the
`snap_notify` permission:

```json
{
  "initialPermissions": {
    "snap_notify": {}
  }
}
```

This permission does not require any additional configuration.

## Snap usage

This snap exposes an `onRpcRequest` handler, which supports the following
JSON-RPC methods:

- `inApp` - Send an in-app notification to the user.
- `native` - Send a desktop notification to the user.

For more information, you can refer to
[the end-to-end tests](./src/index.test.ts).
