# `@metamask/multichain-provider-example-snap`

This Snap demonstrates the use of the `endowment:multichain-provider` permission.

The permission grants the Snap access to CAIP-25 provider methods via `snap.request`.

## Snap manifest

Along with other permissions, the manifest of this snap includes the
`endowment:multichain-provider` permission:

```json
{
  "initialPermissions": {
    "endowment:mulitchain-provider": {}
  }
}
```

This permission does not require any additional configuration.

## Snap usage

This snap exposes an `onRpcRequest` handler, which supports the following
JSON-RPC methods:

- `createSession`: Create the multichain API session.
- `revokeSession`: Revoke the current multichain API session.
- `getChainId`: Get the current Ethereum chain ID as a string.
- `getAccounts`: Get the accounts for the selected scope.
- `signMessage`: Sign a message using an Ethereum or Solana account.
- `signTypedData`: Sign a struct using an Ethereum account.
- `getGenesisHash`: Get the genesis hash for the selected scope.

For more information, you can refer to
[the end-to-end tests](./src/index.test.ts).
