# `@metamask/ethereum-provider-example-snap`

This snap demonstrates the use of the `endowment:ethereum-provider` permission
and the corresponding `ethereum` global. This is similar to the
`window.ethereum` API, but it does not have access to all methods.

## Snap manifest

> **Note**: Using `ethereum` requires the `endowment:ethereum-provider`
> permissions. Refer to [the documentation](https://docs.metamask.io/snaps/reference/permissions/#endowmentethereum-provider)
> for more information.

Along with other permissions, the manifest of this snap includes the
`endowment:ethereum-provider` permission:

```json
{
  "initialPermissions": {
    "endowment:ethereum-provider": {}
  }
}
```

This permission does not require any additional configuration.

## Snap usage

This snap exposes an `onRpcRequest` handler, which supports the following
JSON-RPC method:

- `getGasPrice`: Get the current recommended gas price from an Ethereum
  provider.

For more information, you can refer to
[the end-to-end tests](./src/index.test.ts).
