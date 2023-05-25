# @metamask/create-snap

A CLI for creating MetaMask Snaps.

## Usage

Use this command line tool directly with `yarn create` or `npx` to create a new snap project:

```sh
yarn create @metamask/snap your-snap-name
# or...
npx @metamask/create-snap your-snap-name
# or with npm v6 and later
npm create @metamask/snap your-snap-name
```

## MetaMask Snaps

MetaMask Snaps enables trustlessly extending the functionality of MetaMask at runtime.
A Snap consist of two things: a JSON manifest and a JavaScript bundle.
At present, Snaps can be published as npm packages on the public npm registry, or hosted locally during development.
In the future, it will be possible to publish snaps on many different platforms, including arbitrary npm registries and IPFS.

We recommend creating your snap using this tool.

## How to start developing with MetaMask Snaps?

- Use the [MetaMask Snaps documentation](https://docs.metamask.io/guide/snaps.html)
- Use the [Getting started guide](https://dev.to/metamask/metamask-snaps-dev-guide-3dm3)
- Follow the [MetaMask Snaps step-by-step workshop](https://github.com/ziad-saab/ethdenver-2023-metamask-snaps-workshop)
