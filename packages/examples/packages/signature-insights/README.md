# `@metamask/signature-insights-example-snap`

This snap demonstrates how to use the `endowment:signature-insight` permission
to provide signature insights to the user. This snap uses the `onSignature`
handler to provide insights for signature requests presented to the user.

Signature insights are displayed in the signature confirmation screen, and
can show any [Snaps-based UI](../../../snaps-sdk) components.

## Snap manifest

> **Note**: Using `onSignature` requires the `endowment:signature-insight`
> permissions. Refer to [the documentation](https://docs.metamask.io/snaps/reference/permissions/#endowmentsignature-insight)
> for more information.

Along with other permissions, the manifest of this snap includes the
`endowment:signature-insight` permission:

```json
{
  "initialPermissions": {
    "endowment:signature-insight": {}
  }
}
```

By default, the `onSignature` handler does not receive the signature origin. If you
want to receive the origin, you can add the `allowSignatureOrigin` property to
the permission definition:

```json
{
  "initialPermissions": {
    "endowment:signature-insight": {
      "allowSignatureOrigin": true
    }
  }
}
```

## Snap usage

This snap exposes an `onSignature` handler, which is called when a signature
is presented to the user. The handler receives the signature payload and the
signature origin (if the `allowSignatureOrigin` property is set to `true`).

The snap decodes the signature data and returns the decoded data as the
signature insight.

For more information, you can refer to
[the end-to-end tests](./src/index.test.ts).
