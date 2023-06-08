# `@metamask/snaps-jest`

A [Jest](https://jestjs.io/) preset for end-to-end testing MetaMask Snaps,
including a Jest environment, and a set of Jest matchers.

## Installation

Use Node.js `16.0.0` or later. We recommend using [nvm](https://github.com/nvm-sh/nvm) for managing Node.js versions.

Install a dependency in your snap project using `yarn` or `npm`:

- `npm install --save-dev @metamask/snaps-jest`
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

### Without the preset

If you don't want to use the preset, you can still use the environment and
matchers by adding them to your Jest configuration manually:

```js
module.exports = {
  testEnvironment: '@metamask/snaps-jest',
  setupFilesAfterEnv: ['@metamask/snaps-jest/dist/setup.js'],
};
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

### `executionEnvironmentUrl`

- Type: `string`

The URL of the execution environment to use for testing. This is the URL that
will be loaded by the Snaps Simulator in the tests. By default, it will use the
URL of the built-in HTTP server that is included with this package.

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
