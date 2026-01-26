# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Uncategorized

- release: `139.0.0` ([#3813](https://github.com/MetaMask/snaps/pull/3813))
- chore: Bump @lavamoat/allow-scripts from 3.4.1 to 3.4.2 ([#3809](https://github.com/MetaMask/snaps/pull/3809))

## [3.0.0]

### Added

- Add `getGenesisBlock` method for getting genesis block ([#3788](https://github.com/MetaMask/snaps/pull/3788))

### Removed

- Remove unused RPC methods: `getGasPrice` and `getVersion` ([#3788](https://github.com/MetaMask/snaps/pull/3788))

## [2.4.0]

### Added

- Add `getChainId` method to get current chain ID ([#3407](https://github.com/MetaMask/snaps/pull/3407))

## [2.3.0]

### Changed

- Use `wallet_switchEthereumChain` to switch to specified chain ID ([#2634](https://github.com/MetaMask/snaps/pull/2634))

## [2.2.1]

### Fixed

- Use proper chain ID for `signTypedData` call ([#3013](https://github.com/MetaMask/snaps/pull/3013))

## [2.2.0]

### Added

- Added support for `eth_signTypedData` ([#2969](https://github.com/MetaMask/snaps/pull/2969))

### Changed

- Bump MetaMask dependencies ([#2946](https://github.com/MetaMask/snaps/pull/2946), [#2853](https://github.com/MetaMask/snaps/pull/2853), [#2989](https://github.com/MetaMask/snaps/pull/2989))

## [2.1.3]

### Fixed

- Bump MetaMask dependencies

## [2.1.2]

### Changed

- Use error wrappers ([#2178](https://github.com/MetaMask/snaps/pull/2178))

## [2.1.1]

### Changed

- Remove snap icon ([#2189](https://github.com/MetaMask/snaps/pull/2189))

## [2.1.0]

### Changed

- Use `@metamask/snaps-sdk` package ([#1946](https://github.com/MetaMask/snaps/pull/1946))
  - This package replaces the `@metamask/snaps-types` and
  - `@metamask/snaps-ui` packages, and is much more lightweight.

## [2.0.1]

### Changed

- Update multiple MetaMask dependencies ([#1841](https://github.com/MetaMask/snaps/pull/1841))

## [2.0.0]

### Changed

- **BREAKING:** Bump minimum Node.js version to `^18.16.0` ([#1741](https://github.com/MetaMask/snaps/pull/1741))

## [1.0.0]

### Changed

- Initial stable release from main branch ([#1757](https://github.com/MetaMask/snaps/pull/1757))

## [0.38.1-flask.1]

### Fixed

- Remove unused dependencies ([#1680](https://github.com/MetaMask/snaps/pull/1680))

## [0.38.0-flask.1]

### Added

- Add example JSON-RPC method using `personal_sign` ([#1601](https://github.com/MetaMask/snaps/pull/1601))

### Changed

- Update example to the new configuration format ([#1632](https://github.com/MetaMask/snaps/pull/1632))
  - The example now uses Webpack instead of Browserify.

## [0.37.2-flask.1]

### Changed

- Release package independently ([#1600](https://github.com/MetaMask/snaps/pull/1600))
  - The version of the package no longer needs to match the version of all other
    MetaMask Snaps packages.

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/ethereum-provider-example-snap@3.0.0...HEAD
[3.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/ethereum-provider-example-snap@2.4.0...@metamask/ethereum-provider-example-snap@3.0.0
[2.4.0]: https://github.com/MetaMask/snaps/compare/@metamask/ethereum-provider-example-snap@2.3.0...@metamask/ethereum-provider-example-snap@2.4.0
[2.3.0]: https://github.com/MetaMask/snaps/compare/@metamask/ethereum-provider-example-snap@2.2.1...@metamask/ethereum-provider-example-snap@2.3.0
[2.2.1]: https://github.com/MetaMask/snaps/compare/@metamask/ethereum-provider-example-snap@2.2.0...@metamask/ethereum-provider-example-snap@2.2.1
[2.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/ethereum-provider-example-snap@2.1.3...@metamask/ethereum-provider-example-snap@2.2.0
[2.1.3]: https://github.com/MetaMask/snaps/compare/@metamask/ethereum-provider-example-snap@2.1.2...@metamask/ethereum-provider-example-snap@2.1.3
[2.1.2]: https://github.com/MetaMask/snaps/compare/@metamask/ethereum-provider-example-snap@2.1.1...@metamask/ethereum-provider-example-snap@2.1.2
[2.1.1]: https://github.com/MetaMask/snaps/compare/@metamask/ethereum-provider-example-snap@2.1.0...@metamask/ethereum-provider-example-snap@2.1.1
[2.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/ethereum-provider-example-snap@2.0.1...@metamask/ethereum-provider-example-snap@2.1.0
[2.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/ethereum-provider-example-snap@2.0.0...@metamask/ethereum-provider-example-snap@2.0.1
[2.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/ethereum-provider-example-snap@1.0.0...@metamask/ethereum-provider-example-snap@2.0.0
[1.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/ethereum-provider-example-snap@0.38.1-flask.1...@metamask/ethereum-provider-example-snap@1.0.0
[0.38.1-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/ethereum-provider-example-snap@0.38.0-flask.1...@metamask/ethereum-provider-example-snap@0.38.1-flask.1
[0.38.0-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/ethereum-provider-example-snap@0.37.2-flask.1...@metamask/ethereum-provider-example-snap@0.38.0-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps/releases/tag/@metamask/ethereum-provider-example-snap@0.37.2-flask.1
