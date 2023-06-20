# `@metamask/transaction-insights-example-snap`

This snap demonstrates how to use the `endowment:transaction-insight` permission
to provide transaction insights to the user. This snap uses the `onTransaction`
handler to provide insights for transactions that are sent by the user.

Transaction insights are displayed in the transaction confirmation screen, and
can show any [Snaps-based UI](../../../snaps-ui) components.

## Snap manifest

> **Note**: Using `onTransaction` requires the `endowment:transaction-insight`
> permissions. Refer to [the documentation](https://docs.metamask.io/snaps/reference/permissions/#endowmenttransaction-insight)
> for more information.

Along with other permissions, the manifest of this snap includes the
`endowment:transaction-insight` permission:

```json
{
  "initialPermissions": {
    "endowment:network-access": {}
  }
}
```

By default, the `onTransaction` does not receive the transaction origin. If you
want to receive the origin, you can add the `allowTransactionOrigin` property to
the permission definition:

```json
{
  "initialPermissions": {
    "endowment:transaction-insight": {
      "allowTransactionOrigin": true
    }
  }
}
```

## Snap usage

This snap exposes an `onTransaction` handler, which is called when a transaction
is sent by the user. The handler receives the transaction details and the
transaction origin (if the `allowTransactionOrigin` property is set to `true`).

The snap decodes the transaction data and returns the decoded data as the
transaction insight.

For more information, you can refer to
[the end-to-end tests](./src/index.test.ts).
