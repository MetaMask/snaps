# `@metamask/activity-item-insights-example-snap`

This snap demonstrates how to use the `endowment:activity-item-insight` permission
to provide historical transaction insights to the user. This snap uses the `onViewActivityItem`
handler to provide insights for *past* user transactions.

Activity item insights are displayed in the transaction details modal, and
can show any [Snaps-based UI](../../../snaps-sdk) components.

## Snap manifest

> **Note**: Using `onViewActivityItem` requires the `endowment:activity-item-insight`
> permissions. Refer to [the documentation](https://docs.metamask.io/snaps/reference/permissions)
> for more information.

Along with other permissions, the manifest of this snap includes the
`endowment:activity-item-insight` permission:

```json
{
  "initialPermissions": {
    "endowment:activity-item-insight": {}
  }
}
```

By default, the `onViewActivityItem` does not receive the transaction origin. If you
want to receive the origin, you can add the `allowActivityItemOrigin` property to
the permission definition:

```json
{
  "initialPermissions": {
    "endowment:activity-item-insight": {
      "allowActivityItemOrigin": true
    }
  }
}
```

## Snap usage

This snap exposes an `onViewActivityItem` handler, which is called when a transaction details modal is opened by a user. The handler receives the transaction details and the
transaction origin (if the `allowActivityItemOrigin` property is set to `true`).

The snap simply takes the details about the transaction and displays them. In practice a real Snap may want use transaction details to fetch insights from a remote server and display them to the user.

For more information, you can refer to
[the end-to-end tests](./src/index.test.ts).
