# Secure snap execution in SES

To avoid snaps from getting access to the extension, dangerous APIs, and such,
we run snaps in a different "realm," which is a separate JavaScript execution
environment. Inside this realm we use [SES]'s lockdown feature to harden the
realm, and prevent the snap from breaking out of the sandbox. For certain APIs,
such as the events API, we must do an extra lockdown, to make sure that the
snap can't break out of the sandbox.

Inside this realm, we create an [SES] compartment, which is a
sandboxed JavaScript environment that limits access to global APIs, letting us
control what the snap can do.

## Endowments

The endowments are the global APIs that are available to the snap, such as the
`console` API, the `fetch` function, and so on. To avoid that the snap can
break out of the sandbox, we only give it access to a limited set of APIs, and
we make sure that the APIs we give it are safe to use. For example, snaps don't
have access to the `window` or `document` object, so they can't access the DOM.

Each endowment we provide to the snap is hardened in a couple of ways:

- We freeze and seal the object, so that the snap can't modify it or add new
  properties to it.
- We only provide a limited subset of APIs.
- Certain APIs are wrapped to make sure that they can be torn down properly
  when the snap is being stopped.

Some endowments are provided to the snap by default. A list of these can be
found [here](../../packages/snaps-utils/src/default-endowments.ts). Other
endowments must be requested by the snap, using the permissions system.

## Hardening of the `snap` and `ethereum` globals

...

[ses]: https://github.com/endojs/endo/tree/master/packages/ses
