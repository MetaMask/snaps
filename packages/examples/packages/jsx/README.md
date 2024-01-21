# `@metamask/home-page-example-snap`

This snap demonstrates how to use `endowment:page-home` permission to show
a home page that leverages custom UI components.

## Snap manifest

The manifest of this snap includes the `endowment:page-home` permission:

```json
{
  "initialPermissions": {
    "endowment:page-home": {}
  }
}
```

This permission does not require any additional configuration.

## Snap usage

This snap exposes an `onHomePage` handler, which returns the UI to be shown.
