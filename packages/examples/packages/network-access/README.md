# `@metamask/network-access-example-snap`

This snap demonstrates how to use the `endowment:network-access` permission to
get access to the `fetch` function from a snap.

## Snap manifest

> **Note**: Using `fetch` requires the `endowment:network-access`
> permissions. Refer to [the documentation](https://docs.metamask.io/snaps/reference/permissions/#endowmentnetwork-access)
> for more information.

Along with other permissions, the manifest of this snap includes the
`endowment:network-access` permission:

```json
{
  "initialPermissions": {
    "endowment:network-access": {}
  }
}
```

This permission does not require any additional configuration.

## Snap usage

This snap exposes an `onRpcRequest` handler, which supports the following
JSON-RPC methods:

- `fetch` - Fetch a JSON document from the optional `url`, and return the
  fetched data.

For more information, you can refer to
[the end-to-end tests](./src/index.test.ts).
