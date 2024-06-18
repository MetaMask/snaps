# `@metamask/file-upload-example-snap`

This Snap demonstrates how to use the `FileInput` UI component to upload a file
to a Snap, and display the file's contents in a dialog.

## Snap manifest

File uploads do not require any special permissions in the Snap manifest.

## Snap usage

This Snap exposes an `onRpcRequest` handler, which supports the following
JSON-RPC method:

- `dialog`: Show a dialog with a file input. When the user selects a file, the
  Snap reads the file's contents and displays them in the dialog.

The Snap also exposes a `onUserInput` handler, which handles the file upload
event, in addition to some miscellaneous event handlers.

For more information, you can refer to
[the end-to-end tests](./src/index.test.tsx).
