# `@metamask/interactive-ui-example-snap`

This snap demonstrates how to use interactive UI to build reactive custom UI
interfaces across all the available APIs.

## Snap usage

### onRpcRequest

This snap exposes an `onRpcRequest` handler, which supports the following
JSON-RPC methods:

- `dialog`: Create a `snap_dialog` with an interactive interface. This
  demonstrates that a snap can show an interactive `snap_dialog` that the user
  can interact with.

### onTransaction

This snap exposes an `onTransaction` handler, which is called when a transaction
is sent by the user. It shows a user interface with details about the
transaction.

### onHomePage

The snap exposes an `onHomePage` handler, which shows a user interface.

For more information, you can refer to
[the end-to-end tests](./src/index.test.tsx).
