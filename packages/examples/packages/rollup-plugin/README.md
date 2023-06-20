# `@metamask/rollup-plugin-example-snap`

This snap demonstrates how to use Rollup and the
[`@metamask/snaps-rollup-plugin`](../../../snaps-rollup-plugin) to bundle a
snap. The MetaMask Snap CLI uses Browserify to bundle snaps by default, but
if you prefer to use Rollup, you can use `@metamask/snaps-rollup-plugin` to do
so.

Rollup is configured in the [`rollup.config.js`](./rollup.config.js) file. It
sets up Node.js resolution, CommonJS transpilation, and a few other things.
