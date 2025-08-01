# Snaps Examples

This directory contains multiple examples of snaps. Each directory inside the
`packages/` directory contains a snap, demonstrating a different feature of
the MetaMask Snaps platform.

## Overview

The following is a list of the snaps in this directory.

### Key management & signing

- [**`packages/bip32`**](./packages/bip32): This snap demonstrates how to
  use the `snap_getBip32Entropy` and `snap_getBip32PublicKey` methods to derive
  a BIP-32 public key and private key from the user's secret recovery phrase.
- [**`packages/bip44`**](./packages/bip44): This snap demonstrates how to use
  the `snap_getBip44Entropy` method to derive a BIP-44 account private key from
  the user's secret recovery phrase.
- [**`packages/get-entropy`**](./packages/get-entropy): This snap demonstrates
  how to use the `snap_getEntropy` method to derive deterministic entropy based
  on the user's secret recovery phrase.

### Snaps features

- [**`packages/client-status`**](./packages/client-status): This snap demonstrates
  how to use `snap_getClientStatus` to access information about the client
  executing the snap.
- [**`packages/cronjobs`**](./packages/cronjobs): This snap demonstrates how to
  use the `endowment:cronjob` permission to schedule a function to be called at
  a later time, using cron expressions.
- [**`packages/cronjob-duration`**](./packages/cronjobs): This snap demonstrates how to
  use the `endowment:cronjob` permission to schedule a function to be called at
  a later time, using ISO 8601 durations instead of cron expressions.
- [**`packages/dialogs`**](./packages/dialogs): This snap demonstrates how to
  use the `snap_dialog` method to display different types of dialogs to the
  user.
- [**`packages/ethereum-provider`**](./packages/ethereum-provider):
  This snap demonstrates how to use the `endowment:ethereum-provider` permission
  and corresponding `ethereum` provider to interact with the Ethereum blockchain
  from a snap. This also demonstrates how a snap can access a user's existing
  Ethereum accounts.
- [**`packages/home-page`**](./packages/home-page):
  This snap demonstrates how to use `endowment:page-home` permission,
  showing a home page to the user.
- [**`packages/images`**](./packages/images): This snap demonstrates how to
  render images in a snap. It can generate a QR code from a string, and render
  it in a dialog, as well as render an image from a URL.
  [**`packages/interactive-ui`**](./packages/interactive-ui): This snap demonstrates how to
  use interactive UI in a snap. It can display interactive UIs in various APIs available in the Snap.
- [**`packages/invoke-snap`**](./packages/invoke-snap): These snaps demonstrate
  how to use the `snap_invokeSnap` method to invoke another snap.
- [**`packages/json-rpc`**](./packages/json-rpc): This snap demonstrates how to
  use the `endowment:json-rpc` permission to make requests from snaps and/or
  dapps.
- [**`packages/lifecycle-hooks`**](./packages/lifecycle-hooks): This snap
  demonstrates how to use the `onInstall` and `onUpdate` lifecycle hooks.
- [**`packages/localization`**](./packages/localization): This snap demonstrates
- how to use the `snap_getLocale` method to get the user's locale, translate
  messages, and localize the snap manifest.
- [**`packages/manage-state`**](./packages/manage-state): This snap
  demonstrates how to use the `snap_manageState` method to store and retrieve
  data in a snap.
- [**`packages/name-lookup`**](./packages/name-lookup): This snap
  demonstrates how to use the `endowment:name-lookup` permission to resolve
  domains and addresses in a snap.
- [**`packages/network-access`**](./packages/network-access): This
  snap demonstrates how to use the `endowment:network-access` permission to
  make network requests from a snap.
- [**`packages/notifications`**](./packages/notifications): This snap
  demonstrates how to use the `snap_notify` method to display notifications to
  the user, either as a MetaMask notification or as a desktop notification.
- [**`packages/preferences`**](./packages/preferences): This snap
  demonstrates how to use the `snap_getPreferences` method to get the user's preferences
  from the executing client.
- [**`packages/transaction-insights`**](./packages/transaction-insights):
  This snap demonstrates how to use `endowment:transaction-insights` permission,
  and provide transaction insights to the user.

### 3rd party integrations

- [**`packages/ethers-js`**](./packages/ethers-js): This snap demonstrates how
  to use Ethers.js in a snap.
- [**`packages/rollup-plugin`**](./packages/rollup-plugin): This snap
  demonstrates how to use Rollup to bundle a snap.
- [**`packages/webpack-plugin`**](./packages/webpack-plugin): This snap
  demonstrates how to use Webpack to bundle a snap.

### Miscellaneous

- [**`packages/errors`**](./packages/errors): This snap demonstrates
  how the Snaps platform handles errors thrown by snaps.
- [**`packages/preinstalled`**](./packages/preinstalled): This snap demonstrates
  preinstalled snaps, i.e., snaps that are installed in the MetaMask extension
  by default. It also demonstrates the use of the `endowment:page-settings` permission,
  showing a settings page to the user.
- [**`packages/send-flow`**](./packages/send-flow): This snap demonstrates
  a simple send flow using custom UI.
- [**`packages/wasm`**](./packages/wasm): This snap demonstrates how
  to use WebAssembly in a snap.

## Contributing

To add a new example, create a new directory inside the `packages/` directory
and add a `README.md` file to it. The `README.md` file should contain a
description of the example, and a link to the documentation for the snap's
methods and permissions. You can have a look at the existing examples for
inspiration.

It is recommended to copy the configurations, scripts, and dependencies from
another example, and modify them as needed. For example, if you want to create a
new example called `my-example`, you can copy the `packages/bip32` directory
and rename it to `packages/my-example`. Then, you can modify the
`packages/my-example/package.json` file to change the name of the snap to
`@metamask/my-example-snap`, and modify the `packages/my-example/README.md`
file to describe the example.

Once you have created the new example, you can add it to the list above by
adding a link to the `README.md` file in the list above.

It is recommended to keep the examples as simple as possible, and to avoid
adding unnecessary dependencies, permissions, scripts, etc. to the examples.
This will make it easier for developers to understand the examples, and to use
them as a starting point for their own snaps.

Each snap (if applicable) should have end-to-end tests that test the snap's
functionality. The tests should be located in the `src/index.test.ts(x)` file, and
make use of `@metamask/snaps-jest` to test the snap. You can have a look at the
existing E2E tests for inspiration.
