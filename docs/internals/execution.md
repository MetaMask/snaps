# Secure Snap execution in SES

To avoid Snaps from getting access to the client, dangerous APIs, and such,
we run Snaps in a different "realm," which is a separate JavaScript execution
environment. Inside this realm we use [SES]'s lockdown feature to harden the
realm, and prevent the Snap from breaking out of the sandbox. For certain APIs,
such as the events API, we must do an extra lockdown, to make sure that the
Snap can't break out of the sandbox.

Inside this realm, we create an [SES] compartment, which is a sandboxed
JavaScript environment that limits access to global APIs, letting us control
what the Snap can do.

## Endowments

The endowments are the global APIs that are available to the Snap, such as the
`console` API, the `fetch` function, and so on. To avoid the Snap
breaking out of the sandbox, we only give it access to a limited set of APIs,
and we make sure that the APIs we give it are safe to use. For example, Snaps
don't have access to the `window` or `document` object, so they can't access the
DOM.

Each endowment we provide to the Snap is hardened in a couple of ways:

- We freeze and seal the object, so that the Snap can't modify it or add new
  properties to it.
- We only provide a limited subset of APIs.
- Certain APIs are wrapped to ensure that they can be torn down properly
  when the Snap is being stopped as well as to prevent Snaps interfering with
  each other.

Some endowments are provided to the Snap by default. A list of these can be
found [here](../../packages/snaps-utils/src/default-endowments.ts). Other
endowments must be requested by the Snap, using the permissions system.

Endowments granted via the permission system map to one or more global APIs,
e.g., [endowment:network-access] grants access to `fetch`, `Request`, `Headers`,
and `Response`. These endowments may also be further hardened before being
passed to the Snap, see for example [network hardening], which hardens the
`fetch` global before granting it to the Snap.

<!--

## Hardening of the `snap` and `ethereum` globals

...

-->

[endowment:network-access]: ../../packages/snaps-controllers/src/snaps/endowments/network-access.ts
[network hardening]: ../../packages/snaps-execution-environments/src/common/endowments/network.ts
[ses]: https://github.com/endojs/endo/tree/master/packages/ses
