# `@metamask/wasm-example-snap`

This snap demonstrates how to use the `endowment:webassembly` permission to get
access to the `WebAssembly` global from a snap, and use it to execute a
WebAssembly module.

This example consists of the usual snap files, as well as a `program` directory
that contains the WebAssembly module. This is an
[AssemblyScript](https://www.assemblyscript.org/) module that exports a
`fibonacci` function, which calculates the Fibonacci sequence.

For this example, we're using the AssemblyScript compiler to compile the
WebAssembly module, but you can use any other language that compiles to
WebAssembly.

## Snap manifest

> **Note**: Using `WebAssembly` requires the `endowment:webassembly`
> permissions. Refer to [the documentation](https://docs.metamask.io/snaps/reference/rpc-api/#endowmentwebassembly)
> for more information.

Along with other permissions, the manifest of this snap includes the
`endowment:webassembly` permission:

```json
{
  "initialPermissions": {
    "endowment:webassembly": {}
  }
}
```

This permission does not require any additional configuration.

## Snap usage

This snap exposes an `onRpcRequest` handler, which supports the following
JSON-RPC methods:

- `fibonacci` - Use the `WebAssembly` global to execute a WebAssembly module
  that calculates the Fibonacci sequence. The `n` parameter is used to specify
  the number of iterations to perform.

For more information, you can refer to
[the end-to-end tests](./src/index.test.ts).
