# Test Snap Repo

Snaps used for QA and end-to-end tests, with an accompanying GitHub Pages
website. Like [MetaMask/test-dapp](https://github.com/MetaMask/test-dapp), but
for Snaps.

## Usage

Run `yarn start` to serve the Snaps and the website.

Go to <http://localhost:8080> to see the test app.

## Contributing

The website build script makes certain assumptions about the monorepo, its
snaps, and the contents of the website. Specifically, it assumes that every
other package in the `packages/` directory is a valid snap, and that each snap
has a `snap.config.js` with `cliOptions.port` set to a valid port number.

Finally, the website's `index.html` must have each snap's `local:` ID hardcoded
of the form `local:http://localhost:PORT` where `PORT` is the port number from
its `snap.config.js` file. This allows the website build script to replace these
values with the corresponding `npm:` IDs for GitHub Pages deployments.
