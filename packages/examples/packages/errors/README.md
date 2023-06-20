# `@metamask/error-example-snap`

This snap demonstrates how the Snaps platform handles out-of-band errors.

> **Note**: This snap is primarily used for automated testing. It does not
> provide any functionality to the user.

## Snap usage

This snap exposes an `onRpcRequest` handler. It does not support any particular
JSON-RPC methods, but simply returns a message.

For more information, you can refer to
[the end-to-end tests](./src/index.test.ts).
