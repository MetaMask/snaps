# `@metamask/lifecylce-hooks-example-snap`

This snap demonstrates how to use the `onInstall` and `onUpdate` lifecycle
hooks.

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

This snap exposes the `onInstall` and `onUpdate` lifecycle hooks. These hooks
are called when the snap is installed or updated, respectively, and cannot be
called manually.

For more information, you can refer to
[the end-to-end tests](./src/index.test.ts).
