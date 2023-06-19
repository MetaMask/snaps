# `@metamask/webpack-plugin-example-snap`

This snap demonstrates how to use Webpack and the
[`@metamask/snaps-webpack-plugin`](../../../snaps-webpack-plugin) to bundle a
snap. The MetaMask Snap CLI uses Browserify to bundle snaps by default, but
if you prefer to use Webpack, you can use `@metamask/snaps-webpack-plugin` to do
so.

Webpack is configured in the [`webpack.config.ts`](./webpack.config.ts) file. It
sets up a basic configuration that bundles the snap's source code into a single
file, and outputs it to the `dist/` directory.
