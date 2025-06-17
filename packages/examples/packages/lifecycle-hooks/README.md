# `@metamask/lifecylce-hooks-example-snap`

This Snap demonstrates how to use the `onStart`, `onInstall`, and `onUpdate`
lifecycle hooks.

## Snap manifest

> **Note**: Using lifecycle hooks requires the `endowment:lifecycle-hooks`
> permissions. Refer to [the documentation](https://docs.metamask.io/snaps/reference/permissions/#endowmentlifecycle-hooks)
> for more information.

Along with other permissions, the manifest of this snap includes the
`endowment:lifecycle-hooks` permission:

```json
{
  "initialPermissions": {
    "endowment:lifecycle-hooks": {}
  }
}
```

## Snap usage

This Snap exposes the `onStart`, `onInstall`, and `onUpdate` lifecycle hooks.
These hooks are called when the client is started, when the Snap is installed,
or the Snap is updated, respectively, and cannot be called manually.

For more information, you can refer to
[the end-to-end tests](./src/index.test.ts).
