# `@metamask/settings-page-example-snap`

This snap demonstrates how to use `endowment:page-settings` permission to show
a settings page that leverages custom UI components.

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
