# `@metamask/client-status-example-snap`

This snap demonstrates how to use `snap_getClientStatus` to access information about
the client executing the snap.

## Snap usage

This snap exposes an `onRpcRequest` handler, which supports the following
JSON-RPC methods:

- `status` - Return the status of the executing client.

```

For more information, you can refer to
[the end-to-end tests](./src/index.test.ts).
```
