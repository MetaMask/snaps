# Sign-in with Ethereum and MetaMask Snaps

While Snaps can request the `endowment:ethereum-provider` permission to get access to the MetaMask API, it currently can't be used to call `eth_requestAccounts`. This prevents snaps from directly signing the user in using SIWE, or from any other calls to `personal_sign` and similar methods.

This repository shows an example of a snap requiring a ficticious API key to make some requests. The API key is obtained by doing a Sign-in with Ethereum. Since this requires calling `personal_sign`, which in turn requires access to an account using `eth_requestAccounts`, this signing currently has to happen in the Dapp.

## Relevant parts in the code

- [`signInWithEthereum` function in the Dapp](packages/site/src/utils/snap.ts#L65)
- [`set_api_key` method in the snap](packages/snap/src/index.ts#L54)