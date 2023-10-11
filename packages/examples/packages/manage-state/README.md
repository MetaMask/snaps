# `@metamask/manage-state-example-snap`

This Snap demonstrates how to use `snap_manageState` to store, receive, and
clear internal state within a Snap. This state is encrypted before being stored
on the user's disk, and is the recommended way for storing data in a Snap
long-term.

## Snap manifest

> **Note**: Using `snap_manageState` requires the `snap_manageState`
> permissions. Refer to [the documentation](https://docs.metamask.io/snaps/reference/rpc-api/#snap_managestate)
> for more information.

Along with other permissions, the manifest of this Snap includes the
`snap_manageState` permission:

```json
{
  "initialPermissions": {
    "snap_manageState": {}
  }
}
```

This permission does not require any additional configuration.

## Snap usage

The state is stored in the Snap using the following structure:

```ts
type State = {
  items: string[];
};
```

This Snap exposes an `onRpcRequest` handler, which supports the following
JSON-RPC methods:

- `setState` - Set the state to the provided params. This assumes the new state
  is an object using the above structure, but for simplicity, this is not
  actually validated within the Snap.
- `getState` - Get the state from the Snap. This returns the current state
  if one is set, or a default state otherwise.
- `clearState` - Reset the state to the default state.

For more information, you can refer to
[the end-to-end tests](./src/index.test.ts).
