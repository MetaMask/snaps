# `@metamask/send-flow-example-snap`

This snap demonstrates a simple send flow built with Snaps custom UI.

## Snap usage

### onRpcRequest

This snap exposes an `onRpcRequest` handler, which supports the following
JSON-RPC methods:

- `dialog`: Create a `snap_dialog` with the send flow.

### onHomePage

The snap exposes an `onHomePage` handler, which shows the send flow.

For more information, you can refer to
[the end-to-end tests](./src/index.test.tsx).
