# `@metamask/preinstalled-example-snap`

This snap demonstrates preinstalled Snaps, i.e., Snaps that are installed in the
MetaMask extension by default.

> [!NOTE]
> Preinstalled Snaps are primarily for internal use by MetaMask.

This snap also demonstrates how to use the `endowment:page-settings` permission to show a settings page that leverages custom UI components.

> [!NOTE]
> This endowment is initially restricted to preinstalled snaps only.

## Snap manifest

The manifest of this snap includes the `endowment:page-settings` permission:

```json
{
  "initialPermissions": {
    "endowment:page-settings": {}
  }
}
```

This permission does not require any additional configuration.

## Snap usage

This snap exposes an `onSettingsPage` handler, which returns the UI to be shown.
