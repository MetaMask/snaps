# `@metamask/localization-example-snap`

This snap demonstrates:

- How to use `snap_getLocale` JSON-RPC method to get the currently selected user
  locale from the MetaMask extension, and use it in a snap.
- How to localize the snap manifest.

## Snap manifest

> **Note**: Using `snap_getLocale` requires the `snap_getLocale`
> permissions. Refer to [the documentation](https://docs.metamask.io/snaps/reference/rpc-api/#snap_getlocale)
> for more information.

Along with other permissions, the manifest of this snap includes the
`snap_getLocale` permission:

```json
{
  "initialPermissions": {
    "snap_getLocale": {}
  }
}
```

This permission does not require any additional configuration.

### Localizing the Snap manifest

The snap manifest can be localized by providing one or more localization files
in the Snap manifest's `locales` field. In addition to providing translations
for the JSON-RPC response, the locale files in this example contain a `name` and
`description` field, which are used to localize the snap's name and description
in the manifest.

Note that if your Snap is using manifest localization, you must at a minimum
provide an English locale file. If the user's locale is not available in the
`locales` field, the snap will fall back to the `en` locale.

## Snap usage

This snap exposes an `onRpcRequest` handler, which supports the following
JSON-RPC methods:

- `hello`: Responds with "Hello, world!", localized to the user's locale.

For more information, you can refer to
[the end-to-end tests](./src/index.test.ts).
