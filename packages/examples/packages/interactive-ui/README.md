# `@metamask/interactive-ui-example-snap`

This snap demonstrates how to use interactive UI to build reactive custom UI interfaces accross all the available APIs.

## Snap usage

### onRpcRequest

This snap exposes an `onRpcRequest` handler, which supports the following
JSON-RPC methods:

- `dialog`: Create a `snap_dialog` with an interactive interface. This demonstrates that a snap can show an interactive `snap_dialog` that the user can interact with.

- `get_state`: Get the state of a given interface. This demonstrates that a snap can retrieve an interface state.

### onTransaction

This snap exposes an `onTransaction` handler, which is called when a transaction
is sent by the user.

The snap creates a new Snap interface and returns the ID.

### onHomePage

This snap exposes an `onHomePage` handler, which creates a new Snap interface and returns the ID to be shown.

```

For more information, you can refer to
[the end-to-end tests](./src/index.test.ts).
```
