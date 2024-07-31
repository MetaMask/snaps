# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Uncategorized

- feat: Add RadioButton component ([#2592](https://github.com/MetaMask/snaps-skunkworks.git/pull/2592))
- chore(devDep): Bump `typescript` from `~4.8.4` to `~5.0.4` ([#2594](https://github.com/MetaMask/snaps-skunkworks.git/pull/2594))
- Replace `superstruct` with ESM-compatible fork `@metamask/superstruct` ([#2445](https://github.com/MetaMask/snaps-skunkworks.git/pull/2445))
- fix: Add typed union validation ([#2534](https://github.com/MetaMask/snaps-skunkworks.git/pull/2534))
- feat: Card component ([#2480](https://github.com/MetaMask/snaps-skunkworks.git/pull/2480))
- Add support for custom dialogs in `snaps-jest` ([#2526](https://github.com/MetaMask/snaps-skunkworks.git/pull/2526))
- Support JSX and Interactive UI in simulator ([#2409](https://github.com/MetaMask/snaps-skunkworks.git/pull/2409))
- Add `Container` and `Footer` components ([#2517](https://github.com/MetaMask/snaps-skunkworks.git/pull/2517))
- Support conditional children in most JSX components ([#2506](https://github.com/MetaMask/snaps-skunkworks.git/pull/2506))
- feat!: Checkbox component ([#2501](https://github.com/MetaMask/snaps-skunkworks.git/pull/2501))
- BREAKING: Move form submit `files` to `value` property ([#2504](https://github.com/MetaMask/snaps-skunkworks.git/pull/2504))
- feat: support additional components inside forms ([#2497](https://github.com/MetaMask/snaps-skunkworks.git/pull/2497))
- Add `Tooltip` component ([#2490](https://github.com/MetaMask/snaps-skunkworks.git/pull/2490))
- Add file input component ([#2469](https://github.com/MetaMask/snaps-skunkworks.git/pull/2469))
- feat: Add text alignment prop ([#2489](https://github.com/MetaMask/snaps-skunkworks.git/pull/2489))
- fix: Correct Row variant in JSX ([#2486](https://github.com/MetaMask/snaps-skunkworks.git/pull/2486))
- feat: Allow row tooltips ([#2483](https://github.com/MetaMask/snaps-skunkworks.git/pull/2483))
- feat: Support nested children in JSX ([#2482](https://github.com/MetaMask/snaps-skunkworks.git/pull/2482))
- fix: Revert requiring at least one child ([#2481](https://github.com/MetaMask/snaps-skunkworks.git/pull/2481))
- chore!: Simplify SVG validation ([#2475](https://github.com/MetaMask/snaps-skunkworks.git/pull/2475))
- Require at least 1 child in JSX components ([#2466](https://github.com/MetaMask/snaps-skunkworks.git/pull/2466))
- Bump @metamask/key-tree from 9.1.0 to 9.1.1 ([#2431](https://github.com/MetaMask/snaps-skunkworks.git/pull/2431))

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

[Unreleased]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/bip32-example-snap@2.2.0...HEAD
[2.2.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/bip32-example-snap@2.1.2...@metamask/bip32-example-snap@2.2.0
[2.1.2]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/bip32-example-snap@2.1.1...@metamask/bip32-example-snap@2.1.2
[2.1.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/bip32-example-snap@2.1.0...@metamask/bip32-example-snap@2.1.1
[2.1.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/bip32-example-snap@2.0.1...@metamask/bip32-example-snap@2.1.0
[2.0.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/bip32-example-snap@2.0.0...@metamask/bip32-example-snap@2.0.1
[2.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/bip32-example-snap@1.0.0...@metamask/bip32-example-snap@2.0.0
[1.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/bip32-example-snap@0.37.3-flask.1...@metamask/bip32-example-snap@1.0.0
[0.37.3-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/bip32-example-snap@0.37.2-flask.1...@metamask/bip32-example-snap@0.37.3-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/releases/tag/@metamask/bip32-example-snap@0.37.2-flask.1
