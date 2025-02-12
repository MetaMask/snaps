# `@metamask/protocol-example-snap`

This snap demonstrates how to use `endowment:protocol` to expose protocol
data via the mulitchain API.

This Snap specifically provides this information for the Solana devnet.

## Snap usage

This snap exposes an `onProtocolRequest` handler, which supports the following
JSON-RPC methods:

- `getBlockHeight` - Return the block height of the chain.
- `getGenesisHash` - Return the genesis hash of the chain.

```

For more information, you can refer to
[the end-to-end tests](./src/index.test.ts).
```
