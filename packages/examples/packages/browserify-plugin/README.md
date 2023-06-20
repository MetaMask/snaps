# `@metamask/browserify-plugin-example-snap`

This snap demonstrates how to use Browserify and the
`@metamask/snaps-browserify-plugin` to bundle a snap. The MetaMask Snap CLI uses
Browserify to bundle snaps by default, but if you need more control over the
bundling process, you can use the `@metamask/snaps-browserify-plugin` to
customize it.

The snap is built in the [`scripts/build.ts`](./scripts/build.ts) script, which
creates a Browserify instance and adds the `@metamask/snaps-browserify-plugin`
to it.
