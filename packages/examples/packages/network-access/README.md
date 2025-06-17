# `@metamask/network-access-example-snap`

This snap demonstrates how to use the `endowment:network-access` permission to
get access to the `fetch` function from a Snap. It also demonstrates how to use
WebSockets.

## Snap manifest

> **Note**: Using `fetch` or WebSockets requires the `endowment:network-access`
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
- `startWebSocket` - Open a WebSocket connection to a local Ethereum node
  and subscribe to block updates.
- `stopWebSocket` - Close a WebSocket connection, if one exists.
- `getState` - Get the state of the Snap, including the block number and whether
  the WebSocket connection is active.

For more information, you can refer to
[the end-to-end tests](./src/index.test.ts).
