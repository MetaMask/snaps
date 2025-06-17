# `@metamask/cronjob-duration-example-snap`

This Snap demonstrates the use of the `endowment:cronjob` permission to
periodically execute a function, using ISO 8601 durations.

## Snap manifest

> [!NOTE]
> Using cronjobs in your Snap requires the `endowment:cronjob` permissions.
> Refer to [the documentation](https://docs.metamask.io/snaps/reference/permissions/#endowmentcronjob)
> for more information.

Along with other permissions, the manifest of this snap includes the
`endowment:cronjob` permission:

```json
{
  "initialPermissions": {
    "endowment:cronjob": {
      "jobs": [
        {
          "duration": "PT10S",
          "request": {
            "method": "execute"
          }
        }
      ]
    }
  }
}
```

A Snap can schedule one or more cronjobs by specifying an array of `jobs` in
the `endowment:cronjob` permission. Each job is defined by a `duration` and
a `request` object. The `duration` is an ISO 8601 duration that defines the
interval of the job. The `request` object defines the JSON-RPC request that
will be sent to the snap's `onCronjob` handler when the job is executed.

> [!TIP]
> You can also schedule jobs using cron expressions by using the `expression`
> field instead of `duration`. For more information, refer to the
> [cronjob example](../cronjobs/README.md).

In this example, we schedule a job that executes every minute. When the job is
executed, the snap's `onCronjob` handler is called with the following JSON-RPC
request:

```json
{
  "method": "execute"
}
```

For more information, you can refer to
[the end-to-end tests](./src/index.test.ts).
