# `@metamask/images-example-snap`

This Snap demonstrates how to render images in a Snap. It can generate a QR code
from a string, and render it in a dialog, as well as render an image from a URL.

## Snap manifest

> **Note**: Fetching images using the `getImageComponent` URL requires the
> `endowment:network-access` permission.

Along with other permissions, the manifest of this Snap includes the
`endowment:network-access` and `snap_dialog` permissions:

```json
{
  "initialPermissions": {
    "endowment:network-access": {},
    "snap_dialog": {}
  }
}
```

These permissions do not require any additional configuration.

## Snap usage

This snap exposes an `onRpcRequest` handler, which supports the following
JSON-RPC methods:

- `getQrCode` - Show a QR code in a dialog, for the given `data` parameter.
- `getCat` - Show an image of a random cat in a dialog.

For more information, you can refer to
[the end-to-end tests](./src/index.test.ts).
