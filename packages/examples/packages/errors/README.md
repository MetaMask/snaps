# `@metamask/error-example-snap`

This Snap demonstrates how the Snaps platform handles out-of-band errors.

> **Note**: This Snap is primarily used for automated testing. It does not
> provide any functionality to the user.

## Snap usage

This Snap exposes an `onRpcRequest` handler. It does not support any particular
JSON-RPC methods, but simply returns a message.

For more information, you can refer to
[the end-to-end tests](./src/index.test.ts).
