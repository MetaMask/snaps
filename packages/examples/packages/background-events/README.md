# `@metamask/background-events-example-snap`

This snap demonstrates the use of the `endowment:cronjob` permission to use the background events API.

## Snap manifest

> **Note**: Using background events in your snap requires the`endowment:cronjob`
> permissions. Refer to [the documentation](https://docs.metamask.io/snaps/reference/permissions/#endowmentcronjob)
> for more information.

Along with other permissions, the manifest of this snap includes the
`endowment:cronjob` permission:

```json
{
  "initialPermissions": {
    "endowment:cronjob": {
      "jobs": []
    }
  }
}
```

A snap must specify the `endowment:cronjob` permission to use the background events API. In this example, we schedule a background event that calls on the `fireDialog` method in the `onCronjob` handler. When the job is executed, the snap's `onCronjob` handler is called with the following JSON-RPC requests (respective of whether you're using an ISO 8601 date or duration):

```json
{
  "date": "2025-05-16T16:07:12.856Z",
  "request": {
    "method": "fireDialog"
  }
}
```

```json
{
  "duration": "PT10S"
  "request": {
    method: "fireDialog"
  }
}
```

For more information, you can refer to
[the end-to-end tests](./src/index.test.tsx).
