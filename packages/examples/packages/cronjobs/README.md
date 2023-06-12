# `@metamask/cronjob-example-snap`

This snap demonstrates the use of the `endowment:cronjob` permission to
periodically execute a function.

## Snap manifest

> **Note**: Using cronjobs in your snap requires the`endowment:cronjob`
> permissions. Refer to [the documentation](https://docs.metamask.io/snaps/reference/permissions/#endowmentcronjob)
> for more information.

Along with other permissions, the manifest of this snap includes the
`endowment:cronjob` permission:

```json
{
  "initialPermissions": {
    "endowment:cronjob": {
      "jobs": [
        {
          "expression": "* * * * *",
          "request": {
            "method": "execute"
          }
        }
      ]
    }
  }
}
```

A snap can schedule one or more cronjobs by specifying an array of `jobs` in
the `endowment:cronjob` permission. Each job is defined by an `expression` and
a `request` object. The `expression` is a cron expression that defines the
schedule of the job. The `request` object defines the JSON-RPC request that
will be sent to the snap's `onCronjob` handler when the job is executed.

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
