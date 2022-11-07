# @metamask/snaps-webpack-plugin

A plugin for developing [MetaMask Snaps](https://docs.metamask.io/guide/snaps.html) using [Webpack](https://webpack.js.org/). This can be used as alternative to the `mm-snap` CLI `build` command. It transforms the bundle to fix common issues with SES. For a list of changes the plugin makes, you can refer to [the source code](../utils/src/post-process.ts).

## Installation

Use Node.js `16.0.0` or later. We recommend using [nvm](https://github.com/nvm-sh/nvm) for managing Node.js versions.

Install a dependency in your snap project using `yarn` or `npm`:

- `npm install @metamask/snaps-webpack-plugin`
- `yarn add @metamask/snaps-webpack-plugin`

## Usage

Add the plugin to the `plugins` array in your Webpack configuration:

```ts
// webpack.config.js

import SnapsWebpackPlugin from '@metamask/snaps-webpack-plugin';

export default {
  plugins: [new SnapsWebpackPlugin(options)],
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
   * Whether to evaluate the bundle with SES, to ensure SES compatibility.
   */
  eval: true,

  /**
   * The path to the Snap manifest file. If set, it will be checked and automatically updated with
   * the bundle's hash, if `writeManifest` is enabled. Defaults to `snap/manifest.json` in the
   * current working directory.
   */
  manifestPath: './snap.manifest.json',

  /**
   * Whether to write the updated Snap manifest file to disk. If `manifestPath` is not set, this
   * option has no effect. If this is disabled, an error will be thrown if the manifest file is
   * invalid.
   */
  writeManifest: true,
};
```
