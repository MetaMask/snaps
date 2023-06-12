# `@metamask/ethers-js-example-snap`

This snap demonstrates how to use [Ethers.js](https://ethers.org/) inside a
snap. It is similar to the `snap_getEntropy` example, except that the signing
is done using Ethers.js.

> **Warning**: If you are building your snap with the `mm-snap` CLI, make
> sure to set `transpilationMode` to `localAndDeps`, as Ethers.js requires
> additional transpilation to be bundled.

## Snap usage

This snap exposes an `onRpcRequest` handler, which supports the following
JSON-RPC methods:

- `getAddress`: Derives a private key using the `snap_getEntropy` method, and
  uses Ethers.js to get the public address for the entropy.
- `signMessage`: Derives a private key using the `snap_getEntropy` method, and
  uses it to sign a `message`.

For more information, you can refer to
[the end-to-end tests](./src/index.test.ts).
