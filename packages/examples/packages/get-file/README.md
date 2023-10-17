# `@metamask/get-file-example-snap`

This snap demonstrates how to use `snap_getFile` JSON-RPC method to load
a static file during runtime in your snap.

## Snap manifest

To define a static file you'll need to define it in the manifest:

```json
{
   "source": {
      "shasum": ...,
      "location": ...,
      "files": [
         "./src/foo.json"
      ]
   }
}
```

## Snap usage

This snap exposes an `onRpcRequest` handler, which supports the following
JSON-RPC methods:

- `getFile`: Returns a static JSON file.
- `getFileInBase64`: Returns the same static JSON file in Base64.
- `getFileInHex`: Returns the same static JSON file in hexadecimal.

For more information, you can refer to
[the end-to-end tests](./src/index.test.ts).
