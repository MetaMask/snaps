# `@metamask/browserify-example-snap`

This snap demonstrates how to use the MetaMask Snaps CLI with the legacy
Browserify bundler.

> **Warning**: The Browserify bundler in the MetaMask Snaps CLI is deprecated
> and will be removed in a future release. Please use the Webpack bundler
> instead.

## Snap usage

This snap exposes an `onRpcRequest` handler, which supports the following
JSON-RPC method:

- `hello`: Returns a message for demonstration purposes.

For more information, you can refer to
[the end-to-end tests](./src/index.test.ts).
