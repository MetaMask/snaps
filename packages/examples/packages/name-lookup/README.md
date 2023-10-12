# `@metamask/name-lookup-example-snap`

This Snap demonstrates how to use the `onNameLookup` handler.

## Snap manifest

> **Note**: Using name lookup requires the `endowment:name-lookup` permission.
> Refer to [the documentation](https://docs.metamask.io/snaps/reference/permissions/#endowmentname-lookup)
> for more information.

The manifest of this Snap includes the `endowment:name-lookup` permission:

```json
{
  "initialPermissions": {
    "endowment:name-lookup": ["eip155:1"]
  }
}
```

## Snap usage

This Snap exposes the `onNameLookup` handler. This is called when a MetaMask client
requests the resolution of a domain or address, and cannot be called manually.
