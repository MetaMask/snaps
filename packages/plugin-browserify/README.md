# @metamask/snaps-browserify-plugin

A plugin for developing [MetaMask Snaps](https://docs.metamask.io/guide/snaps.html) using [Browserify](https://browserify.org/). This can be used as alternative to the `mm-snap` CLI `build` command. It transforms the bundle to fix common issues with SES. For a list of changes the plugin makes, you can refer to [the source code](../utils/src/bundle.ts).

## Installation

Use Node.js `14.0.0` or later. We recommend using [nvm](https://github.com/nvm-sh/nvm) for managing Node.js versions.

Install a dependency in your snap project using `yarn` or `npm`:

- `npm install @metamask/snaps-browserify-plugin`
- `yarn add @metamask/snaps-browserify-plugin`

## Usage

```ts
import browserify from 'browserify';

const bundle = browserify();
bundle.plugin('@metamask/snaps-browserify-plugin', options);
```

### Options

All options are optional, and default to `true`.

```ts
import { Options } from '@metamask/snaps-browserify-plugin';

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
