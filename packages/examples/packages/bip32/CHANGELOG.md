# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.3.0]

### Uncategorized

- Refactor SIP-30 implementation and update examples ([#3165](https://github.com/MetaMask/snaps/pull/3165))
- Migrate to ESLint 9 ([#3118](https://github.com/MetaMask/snaps/pull/3118))
- Release 90.0.0 ([#3123](https://github.com/MetaMask/snaps/pull/3123))
- chore(deps): bump @metamask/utils from 11.1.0 to 11.2.0 ([#3091](https://github.com/MetaMask/snaps/pull/3091))
- chore(deps): bump @metamask/utils from 11.0.1 to 11.1.0 ([#3050](https://github.com/MetaMask/snaps/pull/3050))
- Release 88.0.0 ([#3061](https://github.com/MetaMask/snaps/pull/3061))
- Release 87.0.0 ([#3055](https://github.com/MetaMask/snaps/pull/3055))
- Release 85.0.0 ([#3038](https://github.com/MetaMask/snaps/pull/3038))
- Release 82.0.0 ([#3012](https://github.com/MetaMask/snaps/pull/3012))
- Bump MetaMask dependencies ([#2946](https://github.com/MetaMask/snaps/pull/2946))
- chore(deps): bump @metamask/rpc-errors from 7.0.1 to 7.0.2 ([#2989](https://github.com/MetaMask/snaps/pull/2989))
- Release 81.0.0 ([#2964](https://github.com/MetaMask/snaps/pull/2964))
- feat: Automatically add `platformVersion` to manifest ([#2938](https://github.com/MetaMask/snaps/pull/2938))
- feat: Allow async initialization logic ([#2918](https://github.com/MetaMask/snaps/pull/2918))
- Add property and hook for specifying custom cryptography functions ([#2909](https://github.com/MetaMask/snaps/pull/2909))
- chore: Bump MetaMask dependencies ([#2853](https://github.com/MetaMask/snaps/pull/2853))
- Add TypeScript typechecking to snaps-cli ([#2783](https://github.com/MetaMask/snaps/pull/2783))
- Format Snap manifests with Prettier ([#2787](https://github.com/MetaMask/snaps/pull/2787))
- Set target back to ES2020 ([#2767](https://github.com/MetaMask/snaps/pull/2767))
- Set target to ES2022 and lib to ES2023 ([#2751](https://github.com/MetaMask/snaps/pull/2751))
- Update Yarn constraints to use JavaScript-based constraints ([#2740](https://github.com/MetaMask/snaps/pull/2740))
- Update metadata for all packages ([#2748](https://github.com/MetaMask/snaps/pull/2748))
- Add `since-latest-release` script to match `MetaMask/core` ([#2744](https://github.com/MetaMask/snaps/pull/2744))
- Update test scripts to match `MetaMask/core` ([#2745](https://github.com/MetaMask/snaps/pull/2745))
- Fix linting of `package.json` files ([#2742](https://github.com/MetaMask/snaps/pull/2742))
- Update changelog validation scripts to match `MetaMask/core` ([#2741](https://github.com/MetaMask/snaps/pull/2741))

## [2.2.1]

### Fixed

- Bump MetaMask dependencies

## [2.2.0]

### Added

- Add support for `ed25519Bip32` to the BIP-32 example snap ([#2428](https://github.com/MetaMask/snaps/pull/2428))

## [2.1.2]

### Changed

- Use error wrappers ([#2178](https://github.com/MetaMask/snaps/pull/2178))

## [2.1.1]

### Changed

- Remove snap icon ([#2189](https://github.com/MetaMask/snaps/pull/2189))

## [2.1.0]

### Changed

- Use `@metamask/snaps-sdk` package ([#1930](https://github.com/MetaMask/snaps/pull/1930),
  [#1946](https://github.com/MetaMask/snaps/pull/1946), [#1950](https://github.com/MetaMask/snaps/pull/1950),
  [#1949](https://github.com/MetaMask/snaps/pull/1949), [#1954](https://github.com/MetaMask/snaps/pull/1954))
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

## [0.37.3-flask.1]

### Changed

- Use `polyfills` option for specifying Node.js polyfills ([#1650](https://github.com/MetaMask/snaps/pull/1650))

### Fixed

- Remove unused dependencies ([#1680](https://github.com/MetaMask/snaps/pull/1680))

## [0.37.2-flask.1]

### Changed

- Release package independently ([#1600](https://github.com/MetaMask/snaps/pull/1600))
  - The version of the package no longer needs to match the version of all other
    MetaMask Snaps packages.

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/bip32-example-snap@2.3.0...HEAD
[2.3.0]: https://github.com/MetaMask/snaps/compare/@metamask/bip32-example-snap@2.2.1...@metamask/bip32-example-snap@2.3.0
[2.2.1]: https://github.com/MetaMask/snaps/compare/@metamask/bip32-example-snap@2.2.0...@metamask/bip32-example-snap@2.2.1
[2.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/bip32-example-snap@2.1.2...@metamask/bip32-example-snap@2.2.0
[2.1.2]: https://github.com/MetaMask/snaps/compare/@metamask/bip32-example-snap@2.1.1...@metamask/bip32-example-snap@2.1.2
[2.1.1]: https://github.com/MetaMask/snaps/compare/@metamask/bip32-example-snap@2.1.0...@metamask/bip32-example-snap@2.1.1
[2.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/bip32-example-snap@2.0.1...@metamask/bip32-example-snap@2.1.0
[2.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/bip32-example-snap@2.0.0...@metamask/bip32-example-snap@2.0.1
[2.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/bip32-example-snap@1.0.0...@metamask/bip32-example-snap@2.0.0
[1.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/bip32-example-snap@0.37.3-flask.1...@metamask/bip32-example-snap@1.0.0
[0.37.3-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/bip32-example-snap@0.37.2-flask.1...@metamask/bip32-example-snap@0.37.3-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps/releases/tag/@metamask/bip32-example-snap@0.37.2-flask.1
