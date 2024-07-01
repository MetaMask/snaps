# `@metamask/snaps-jest`

A [Jest](https://jestjs.io/) preset for end-to-end testing MetaMask Snaps,
including a Jest environment, and a set of Jest matchers.

- [Installation](#installation)
- [Usage](#usage)
  - [Without the preset](#without-the-preset)
- [API](#api)
  - [Install a snap](#install-a-snap)
  - [`snap.request`](#snaprequest)
  - [`snap.onTransaction`](#snapontransaction)
  - [`snap.onSignature`](#snaponsignature)
  - [`snap.onCronjob`](#snaponcronjob)
  - [`snap.onHomePage`](#snaponhomepage)
  - [Jest matchers](#jest-matchers)
  - [Interacting with user interfaces](#interacting-with-user-interfaces)
- [Options](#options)

## Installation

Use Node.js `16.0.0` or later. We recommend using [nvm](https://github.com/nvm-sh/nvm) for managing Node.js versions.

Install a dependency in your snap project using `yarn` (or `npm`):

- `yarn add -D @metamask/snaps-jest`

## Usage

The easiest way to use this package is to add it to your Jest configuration as
a preset. In your `jest.config.js` file, add the following:

```js
module.exports = {
  preset: '@metamask/snaps-jest',
};
```

This will automatically configure Jest to use the `@metamask/snaps-jest`
environment, and to use the `@metamask/snaps-jest` matchers.

Then you can just run `jest` as usual.

> **Note**: `@metamask/snaps-jest` assumes that the snap is built in the
> directory you're running Jest from. If you're using a different directory,
> you can specify the path to the snap using the [`root`](#options) option, or
> by running your own HTTP server.
>
> Right now it's not possible to use `@metamask/snaps-jest` with a snap that
> isn't built.

### Without the preset

If you don't want to use the preset, you can still use the environment and
matchers by adding them to your Jest configuration manually:

```js
module.exports = {
  testEnvironment: '@metamask/snaps-jest',
  setupFilesAfterEnv: ['@metamask/snaps-jest/dist/cjs/setup.js'],
};
```

## API

### Install a snap

`@metamask/snaps-jest` exposes a `installSnap` function that can be used to
install a snap in the execution environment. It's recommended to use this
function in each test, to ensure that each test starts with a clean slate.

By default, if the built-in server is enabled, it will install the snap from
the built-in server. Otherwise, you must specify a snap ID to install.

```js
import { installSnap } from '@metamask/snaps-jest';

describe('MySnap', () => {
  it('should do something', async () => {
    await installSnap(/* optional snap ID */);
    // ...
  });
});
```

The `installSnap` function returns an object with functions that can be used to
interact with the snap.

### `snap.request`

The `request` function can be used to send a JSON-RPC request to the snap. It
takes a single argument, which is similar to a JSON-RPC request object, but
with an additional optional `origin` property. It returns a promise that
resolves to the response from the
[onRpcRequest](https://docs.metamask.io/snaps/reference/exports/#onrpcrequest)
function.

```js
import { installSnap } from '@metamask/snaps-jest';

describe('MySnap', () => {
  it('should do something', async () => {
    const { request } = await installSnap(/* optional snap ID */);
    const response = await request({
      origin: 'http://localhost:8080',
      method: 'foo',
      params: [],
    });
    // ...
  });
});
```

It returns an object with a response, and some additional metadata, which can be
checked using the [Jest matchers](#jest-matchers):

```js
import { installSnap } from '@metamask/snaps-jest';

describe('MySnap', () => {
  it('should do something', async () => {
    const { request } = await installSnap(/* optional snap ID */);
    const response = await request({
      origin: 'http://localhost:8080',
      method: 'foo',
      params: [],
    });

    expect(response).toRespondWith('bar');
    expect(response).not.toRespondWithError('baz');
  });
});
```

#### Checking the response with standard Jest matchers

If you prefer, you can also manually check the response:

```js
import { installSnap } from '@metamask/snaps-jest';

describe('MySnap', () => {
  it('should do something', async () => {
    const { request } = await installSnap(/* optional snap ID */);
    const { response } = await request({
      origin: 'http://localhost:8080',
      method: 'foo',
      params: [],
    });

    expect(response.result).toBe('bar');
    expect(response.error).toBeUndefined();
  });
});
```

Since the response is a standard JSON-RPC response, you can use any Jest
matchers to check it, including snapshot matchers:

```js
import { installSnap } from '@metamask/snaps-jest';

describe('MySnap', () => {
  it('should do something', async () => {
    const { request } = await installSnap(/* optional snap ID */);
    const { response } = await request({
      origin: 'http://localhost:8080',
      method: 'foo',
      params: [],
    });

    expect(response).toMatchSnapshot();
  });
});
```

### `snap.onTransaction`

The `onTransaction` function can be used to send a transaction to the snap. It
takes a single argument, which is an object with the following properties:

- `origin`: The origin of the transaction.
- `chainId`: The chain ID of the transaction.
- `from`: The address of the sender.
- `to`: The address of the recipient.
- `value`: The value of the transaction, in wei.
- `data`: The data of the transaction.
- `gasLimit`: The gas limit of the transaction.
- `maxFeePerGas`: The maximum fee per gas of the transaction.
- `maxPriorityFeePerGas`: The maximum priority fee per gas of the transaction.
- `nonce`: The nonce of the transaction.

All properties are optional, and have sensible defaults. The addresses are
randomly generated by default. Most values can be specified as a hex string, or
a decimal number.

It returns a `getInterface` function that gets the user interface that was shown by the snap, in the
[onTransaction](https://docs.metamask.io/snaps/reference/exports/#ontransaction)
function.

```js
import { installSnap } from '@metamask/snaps-jest';
import { panel, text } from '@metamask/snaps-sdk';

describe('MySnap', () => {
  it('should do something', async () => {
    const { onTransaction } = await installSnap(/* optional snap ID */);
    const response = await onTransaction({
      value: '0x0',
      data: '0x',
      gasLimit: '0x5208',
      maxFeePerGas: '0x5208',
      maxPriorityFeePerGas: '0x5208',
      nonce: '0x0',
    });

    const screen = response.getInterface();

    expect(screen).toRender(panel([text('Hello, world!')]));
  });
});
```

### `snap.onSignature`

The `onSignature` function can be used to send a signature request to the snap. It
takes a single argument, which is an object with the following properties:

- `origin`: The origin of the signature request.
- `from`: The address of the signer.
- `data`: The data of the signature.
- `signatureMethod`: The signature method being used in the request.

All properties are optional, and have sensible defaults. The addresses are
randomly generated by default. Most values can be specified as a hex string, or
a decimal number.

It returns a `getInterface` function that gets the user interface that was shown by the snap, in the
[onSignature](https://docs.metamask.io/snaps/reference/exports/#onsignature)
function.

```js
import { installSnap } from '@metamask/snaps-jest';
import { panel, text } from '@metamask/snaps-sdk';

describe('MySnap', () => {
  it('should do something', async () => {
    const { onSignature } = await installSnap(/* optional snap ID */);
    const response = await onSignature();

    const screen = response.getInterface();

    expect(screen).toRender(
      panel([text('You are using the personal_sign method')]),
    );
  });
});
```

### `snap.onCronjob`

The `onCronjob` function can be used to run a cronjob in the snap. It takes
a single argument, which is similar to a JSON-RPC request object. It returns
a promise that resolves to the response from the
[onCronjob](https://docs.metamask.io/snaps/reference/exports/#oncronjob)
function.

The request would normally be specified in the snap manifest under the
`endowment:cronjob` permission, but this function allows you to run cronjobs
that are not specified in the manifest as well.

```js
import { installSnap } from '@metamask/snaps-jest';

describe('MySnap', () => {
  it('should do something', async () => {
    const { onCronjob } = await installSnap(/* optional snap ID */);
    const response = await onCronjob({
      method: 'foo',
      params: [],
    });
    // ...
  });
});
```

It returns an object with a response, and some additional metadata, which can be
checked using the [Jest matchers](#jest-matchers):

```js
import { installSnap } from '@metamask/snaps-jest';

describe('MySnap', () => {
  it('should do something', async () => {
    const { onCronjob } = await installSnap(/* optional snap ID */);
    const response = await onCronjob({
      method: 'foo',
      params: [],
    });

    expect(response).toRespondWith('bar');
    expect(response).not.toRespondWithError('baz');
  });
});
```

### `snap.onHomePage`

The `onHomePage` function can be used to request the home page of the snap. It
takes no arguments, and returns a promise that contains a `getInterface` function to get the response from the
[onHomePage](https://docs.metamask.io/snaps/reference/entry-points/#onhomepage)
function.

```js
import { installSnap } from '@metamask/snaps-jest';

describe('MySnap', () => {
  it('should do something', async () => {
    const { onHomePage } = await installSnap(/* optional snap ID */);
    const response = await onHomePage({
      method: 'foo',
      params: [],
    });

    const screen = response.getInterface();

    expect(screen).toRender(/* ... */);
  });
});
```

### Jest matchers

`@metamask/snaps-jest` includes a set of Jest matchers that can be used to
assert that a response from a snap matches an expected value:

- `toRespondWith(expectedResponse)`: Check if a response matches an expected
  response. This matcher will check the `result` property of the response. If
  the response is an error, it will fail.
- `toRespondWithError(expectedError)`: Check if a response matches an expected
  error. This matcher will check the `error` property of the response. If the
  response is not an error, it will fail.
- `toSendNotification(notificationText)`: Check if a snap sent a notification.
- `toRender(expectedInterface)`: Check if a snap rendered an interface. This is
  useful for testing the UI of a snap, either for a
  [`snap_dialog`](https://docs.metamask.io/snaps/reference/rpc-api/#snap_dialog),
  UI rendered by
  [the transaction insights API](https://docs.metamask.io/snaps/reference/exports/#ontransaction) or
  [the signature insights API](https://docs.metamask.io/snaps/reference/exports/#onsignature).

### Interacting with user interfaces

#### `snap_dialog`

If your snap uses `snap_dialog` to show user interfaces, you can use the
`request.getInterface` function to interact with them. This method is present on
the return value of the `snap.request` function.

It waits for the user interface to be shown, and returns an object with
functions that can be used to interact with the user interface.

##### Example

```js
import { installSnap, assertIsAlertDialog } from '@metamask/snaps-jest';
import { text } from '@metamask/snaps-sdk';
import { assert } from '@metamask/utils';

describe('MySnap', () => {
  it('should do something', async () => {
    const { request } = await installSnap(/* optional snap ID */);

    // Note: We cannot resolve the promise yet!
    const response = request({
      method: 'foo',
    });

    const ui = await response.getInterface();

    // This is useful if you're using TypeScript, since it will infer the type
    // of the user interface.
    assertIsAlertDialog(ui);
    expect(ui).toRender(text('Hello, world!'));

    // "Click" the OK button.
    await ui.ok();

    // Now we can resolve the promise.
    const result = await response;
    expect(result).toRespondWith('bar');
  });
});
```

#### handlers

If your snap uses handlers that shows user interfaces (`onTransaction`, `onSignature`, `onHomePage`), you can use the
`response.getInterface` function to interact with them. This method is present on
the return value of the `snap.request` function.

It returns an object with functions that can be used to interact with the user interface.

##### Example

```js
import { installSnap } from '@metamask/snaps-jest';

describe('MySnap', () => {
  it('should do something', async () => {
    const { onHomePage } = await installSnap(/* optional snap ID */);
    const response = await onHomePage({
      method: 'foo',
      params: [],
    });

    const screen = response.getInterface();

    expect(screen).toRender(/* ... */);
  });
});
```

### User interactions in user interfaces

The object returned by the `getInterface` function exposes other functions to trigger user interactions in the user interface.

- `clickElement(elementName)`: Click on a button inside the user interface. If the button with the given name does not exist in the interface this method will throw.
- `typeInField(elementName, valueToType)`: Enter a value in a field inside the user interface. If the input field with the given name des not exist in the interface this method will throw.

#### Example

```js
import { installSnap } from '@metamask/snaps-jest';

describe('MySnap', () => {
  it('should do something', async () => {
    const { onHomePage } = await installSnap(/* optional snap ID */);
    const response = await onHomePage({
      method: 'foo',
      params: [],
    });

    const screen = response.getInterface();

    expect(screen).toRender(/* ... */);

    await screen.clickElement('myButton');

    const screen = response.getInterface();

    expect(screen).toRender(/* ... */);
  });
});
```

```js
import { installSnap } from '@metamask/snaps-jest';

describe('MySnap', () => {
  it('should do something', async () => {
    const { onHomePage } = await installSnap(/* optional snap ID */);
    const response = await onHomePage({
      method: 'foo',
      params: [],
    });

    const screen = response.getInterface();

    expect(screen).toRender(/* ... */);

    await screen.typeInField('myField', 'the value to type');

    const screen = response.getInterface();

    expect(screen).toRender(/* ... */);
  });
});
```

## Options

You can pass options to the test environment by adding a
`testEnvironmentOptions` property to your Jest configuration. For example:

```js
module.exports = {
  preset: '@metamask/snaps-jest',
  testEnvironmentOptions: {
    // Options go here.
  },
};
```

All options are optional, and have sensible defaults.

### `server`

- Type: `object`

Options for the built-in HTTP server that is included with this package. This
server is used to serve the execution environment, simulator, and the snap
bundle during tests.

#### `server.enabled`

- Type: `boolean`
- Default: `true`

Whether to enable the built-in HTTP server. By default, it will be enabled. If
you want to use your own HTTP server, you can disable this option, and use the
`executionEnvironmentUrl` and `simulatorUrl` options to configure the URLs of
your own server.

##### Example

```js
module.exports = {
  preset: '@metamask/snaps-jest',
  testEnvironmentOptions: {
    server: {
      enabled: false,
    },
  },
};
```

#### `server.port`

- Type: `number`

The port to use for the built-in HTTP server. By default, it will use a random
available (unprivileged) port.

##### Example

```js
module.exports = {
  preset: '@metamask/snaps-jest',
  testEnvironmentOptions: {
    server: {
      port: 8080,
    },
  },
};
```

#### `server.root`

- Type: `string`
- Default: `process.cwd()`

The root directory to serve the snap files from. By default, it will use the
current working directory. This is useful if you want to serve the snap files
from a different directory than the one that Jest is running from.

##### Example

```js
module.exports = {
  preset: '@metamask/snaps-jest',
  testEnvironmentOptions: {
    server: {
      root: '/path/to/snap/files',
    },
  },
};
```
