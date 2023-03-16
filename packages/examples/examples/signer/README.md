# Signer Example Snaps

This example shows how to create a snap that can sign transactions using entropy
from another snap. It consists of multiple snaps:

- A core snap that contains the logic for deriving keys from the snap's own
  entropy. This entropy is snap-specific, and while based on the user's secret
  recovery phrase, does not expose the user's own private keys.
- An Ethereum signer snap that uses the core snap to derive keys, and then
  signs transactions using those keys.

## Usage

To use the example, first build both snaps:

```bash
yarn build
```

Then start a web server to serve the snaps:

```bash
yarn start
```

Now you can navigate to the Ethereum snap interface
[`http://localhost:8101`](http://localhost:8101) in your browser.
