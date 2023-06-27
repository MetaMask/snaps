# `@metamask/snaps-jest`

A [Jest](https://jestjs.io/) preset for end-to-end testing MetaMask Snaps,
including a Jest environment, and a set of Jest matchers. This package is
currently experimental, and the API may change in the future.

- [Installation](#installation)
- [Usage](#usage)
  - [Without the preset](#without-the-preset)
- [API](#api)
  - [Install a snap](#install-a-snap)
  - [`snap.request`](#snaprequest)
  - [`snap.sendTransaction`](#snapsendtransaction)
  - [`snap.runCronjob`](#snapruncronjob)
  - [Jest matchers](#jest-matchers)
  - [Interacting with user interfaces](#interacting-with-user-interfaces)
  - [Network mocking](#network-mocking-snapmock)
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
install a snap in the browser. It's recommended to use this function in each
test, to ensure that each test starts with a clean slate.

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

### `snap.sendTransaction`

The `sendTransaction` function can be used to send a transaction to the snap. It
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

It returns an object with the user interface that was shown by the snap, in the
[onTransaction](https://docs.metamask.io/snaps/reference/exports/#ontransaction)
function.

```js
import { installSnap } from '@metamask/snaps-jest';
import { panel, text } from '@metamask/snaps-ui';

describe('MySnap', () => {
  it('should do something', async () => {
    const { sendTransaction } = await installSnap(/* optional snap ID */);
    const response = await sendTransaction({
      value: '0x0',
      data: '0x',
      gasLimit: '0x5208',
      maxFeePerGas: '0x5208',
      maxPriorityFeePerGas: '0x5208',
      nonce: '0x0',
    });

    expect(response).toRender(panel([text('Hello, world!')]));
  });
});
```

### `snap.runCronjob`

The `runCronjob` function can be used to run a cronjob in the snap. It takes
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
    const { runCronjob } = await installSnap(/* optional snap ID */);
    const response = await runCronjob({
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
    const { runCronjob } = await installSnap(/* optional snap ID */);
    const response = await runCronjob({
      method: 'foo',
      params: [],
    });

    expect(response).toRespondWith('bar');
    expect(response).not.toRespondWithError('baz');
  });
});
```

### `snap.close`

The `close` function can be used to close the page that the test is running in.
This is mainly useful for cleaning up after a test, and is not required. It can
potentially speed up your tests, since it prevents too many pages from being
open at the same time.

```js
import { installSnap } from '@metamask/snaps-jest';

describe('MySnap', () => {
  it('should do something', async () => {
    const { close } = await installSnap(/* optional snap ID */);
    // ...
    await close();
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
  or a UI rendered by
  [the transaction insights API](https://docs.metamask.io/snaps/reference/exports/#ontransaction).

### Interacting with user interfaces

If your snap uses `snap_dialog` to show user interfaces, you can use the
`request.getInterface` function to interact with them. This method is present on
the return value of the `snap.request` function.

It waits for the user interface to be shown, and returns an object with
functions that can be used to interact with the user interface.

#### Example

```js
import { installSnap } from '@metamask/snaps-jest';
import { text } from '@metamask/snaps-ui';
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
    assert(ui.type === 'alert');
    expect(ui).toRender(text('Hello, world!'));

    // "Click" the OK button.
    await ui.ok();

    // Now we can resolve the promise.
    const result = await response;
    expect(result).toRespondWith('bar');
  });
});
```

### Network mocking (`snap.mock`)

`@metamask/snaps-jest` includes basic network mocking functionality. This can
be used to mock the response of any network request made by the snap through
the `endowment:network-access` functionality.

The mock function takes a single argument, which is an object with the
following properties:

- `url` (`string | RegExp`): The URL of the request. This can be a string, or a
  regular expression.
- `partial` (`boolean`): If enabled, the request will be mocked if the URL
  starts with the given URL. This option is ignored if a RegExp is provided to
  the `url` option. Defaults to `false`.
- `response` (`object`): An object with the response.
  - `status` (`number`): The status code of the response. Defaults to `200`.
  - `body` (`string`): The body of the response. Defaults to an empty string.
  - `headers` (`object`): An object with the headers of the response. By
    default, this will use headers that enable CORS.
  - `contentType` (`string`): The content type of the response. Defaults to
    `text/plain`.

Except for the `url` option, all options are optional.

#### Unmocking (`mock.unmock`)

The mock function returns an object with an `unmock` function that can be
used to remove the mock. Mocking happens on a per-snap-install basis. If the
mock is not removed, it will remain active for the rest of the snap
installation, so it does not affect other tests with a fresh snap installation.

#### Example

```js
import { installSnap } from '@metamask/snaps-jest';

describe('MySnap', () => {
  it('should do something', async () => {
    const { mock, request } = await installSnap(/* optional snap ID */);

    const { unmock } = mock({
      url: 'https://example.com',
      status: 200,
      body: 'Hello, world!',
    });

    // ...

    unmock();
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

### `keepAlive`

- Type: `boolean`
- Default: `false`

Whether to keep the Jest environment running after the tests have finished. This
is useful for debugging, but should not be used in CI environments: When this is
enabled, the `jest` process will not exit on its own, and will need to be
manually killed (e.g., with <kbd>Ctrl</kbd> + <kbd>C</kbd>).

#### Example

```js
module.exports = {
  preset: '@metamask/snaps-jest',
  testEnvironmentOptions: {
    keepAlive: true,
  },
};
```

### `browser`

- Type: `object`

Options for the browser that is used to run the tests.

#### `browser.headless`

- Type: `boolean`
- Default: `true`

Whether to run the browser in headless mode. By default, it will be enabled. If
you want to see the browser window while the tests are running, you can disable
this option. Note that this will require you to have a graphical environment
available, so it is not recommended for CI environments, but can be useful for
debugging in conjunction with the `keepAlive` option.

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

##### Example

```js
module.exports = {
  preset: '@metamask/snaps-jest',
  testEnvironmentOptions: {
    browser: {
      headless: false,
    },
  },
};
```

### `executionEnvironmentUrl`

- Type: `string`

The URL of the execution environment to use for testing. This is the URL that
will be loaded by the Snaps Simulator in the tests. By default, it will use the
URL of the built-in HTTP server that is included with this package.

> **Note**: This option is intended for advanced use cases. In most cases, you
> should not need to change this option.

See also: [`@metamask/snaps-execution-environments`](../snaps-execution-environments/README.md).

#### Example

```js
module.exports = {
  preset: '@metamask/snaps-jest',
  testEnvironmentOptions: {
    executionEnvironmentUrl: 'http://localhost:8080',
  },
};
```

### `simulatorUrl`

- Type: `string`

The URL of the simulator to use for testing. This is the URL that will be
loaded in the browser when running tests. By default, it will use the URL of
the built-in HTTP server that is included with this package.

> **Note**: This option is intended for advanced use cases. In most cases, you
> should not need to change this option.

See also: [`@metamask/snaps-simulator`](../snaps-simulator/README.md).

#### Example

```js
module.exports = {
  preset: '@metamask/snaps-jest',
  testEnvironmentOptions: {
    simulatorUrl: 'http://localhost:8081',
  },
};
```
