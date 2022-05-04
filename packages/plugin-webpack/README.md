# @metamask/snaps-webpack-plugin

A plugin for developing [MetaMask Snaps](https://docs.metamask.io/guide/snaps.html) using [Webpack](https://webpack.js.org/). This can be used as alternative to the `mm-snap` CLI `build` command. It transforms the bundle to fix common issues with SES. For a list of changes the plugin makes, you can refer to [the source code](../utils/src/bundle.ts).

## Installation

Use Node.js `14.0.0` or later. We recommend using [nvm](https://github.com/nvm-sh/nvm) for managing Node.js versions.

Install a dependency in your snap project using `yarn` or `npm`:

- `npm install @metamask/snaps-webpack-plugin`
- `yarn add @metamask/snaps-webpack-plugin`

## Usage

Add the plugin to the `plugins` array in your Webpack configuration:

```ts
// webpack.config.js

import SnapsWebpackPlugin from '@metamask/snaps-webpack-plugin';

export default {
  plugins: [
    new SnapsWebpackPlugin(options),
  ]
};
```

### Options

All options are optional, and default to `true`.

```ts
import { Options } from '@metamask/snaps-webpack-plugin';

const options: Options = {
  /**
   * Whether to strip all comments from the bundle.
   */
  stripComments: true,

  /**
   * Whether to break up tokens that could be parsed as HTML comment terminators. This may change
   * the behaviour of programs that contain HTML comment terminators in string literals.
   */
  transformHtmlComments: true,
};
```
