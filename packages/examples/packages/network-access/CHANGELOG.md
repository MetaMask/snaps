# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Uncategorized

- chore: Bump @lavamoat/allow-scripts from 3.4.0 to 3.4.1 ([#3744](https://github.com/MetaMask/snaps/pull/3744))
- chore: Bump @metamask/utils from 11.8.1 to 11.9.0 ([#3783](https://github.com/MetaMask/snaps/pull/3783))
- release: `137.0.0` ([#3780](https://github.com/MetaMask/snaps/pull/3780))
- release: `134.0.0` ([#3761](https://github.com/MetaMask/snaps/pull/3761))
- release: `131.0.0` ([#3730](https://github.com/MetaMask/snaps/pull/3730))
- release: `126.0.0` ([#3662](https://github.com/MetaMask/snaps/pull/3662))
- chore: Bump @lavamoat/allow-scripts from 3.3.5 to 3.4.0 ([#3651](https://github.com/MetaMask/snaps/pull/3651))
- chore: Bump @metamask/utils from 11.7.0 to 11.8.1 ([#3648](https://github.com/MetaMask/snaps/pull/3648))
- chore: Bump @metamask/utils from 11.6.0 to 11.7.0 ([#3628](https://github.com/MetaMask/snaps/pull/3628))
- chore: Bump @metamask/utils from 11.4.2 to 11.5.0 ([#3623](https://github.com/MetaMask/snaps/pull/3623))
- chore: Bump @lavamoat/allow-scripts from 3.3.4 to 3.3.5 ([#3612](https://github.com/MetaMask/snaps/pull/3612))
- release: 120.0.0 ([#3543](https://github.com/MetaMask/snaps/pull/3543))
- release: `119.0.0` ([#3533](https://github.com/MetaMask/snaps/pull/3533))
- chore: Bump @metamask/utils from 11.4.1 to 11.4.2 ([#3526](https://github.com/MetaMask/snaps/pull/3526))
- release: `118.0.0` ([#3524](https://github.com/MetaMask/snaps/pull/3524))
- chore: Bump @metamask/utils from 11.4.0 to 11.4.1 ([#3516](https://github.com/MetaMask/snaps/pull/3516))
- release: `116.0.0` ([#3509](https://github.com/MetaMask/snaps/pull/3509))
- feat: Add `snap_trackError` method for error tracking through Sentry ([#3498](https://github.com/MetaMask/snaps/pull/3498))
- chore(dev-deps): Bump LavaMoat dependencies ([#3501](https://github.com/MetaMask/snaps/pull/3501))

## [2.2.0]

### Added

- Add WebSocket functionality ([#3458](https://github.com/MetaMask/snaps/pull/3458))

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

## [0.38.2-flask.1]

### Fixed

- Fix network access example snap ([#1747](https://github.com/MetaMask/snaps/pull/1747))

## [0.38.1-flask.1]

### Changed

- Use `polyfills` option for specifying Node.js polyfills ([#1650](https://github.com/MetaMask/snaps/pull/1650))

### Fixed

- Remove unused dependencies ([#1680](https://github.com/MetaMask/snaps/pull/1680))

## [0.38.0-flask.1]

### Changed

- Update example to the new configuration format ([#1632](https://github.com/MetaMask/snaps/pull/1632))
  - The example now uses Webpack instead of Browserify.

## [0.37.2-flask.1]

### Changed

- Release package independently ([#1600](https://github.com/MetaMask/snaps/pull/1600))
  - The version of the package no longer needs to match the version of all other
    MetaMask Snaps packages.

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/network-example-snap@2.2.0...HEAD
[2.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/network-example-snap@2.1.3...@metamask/network-example-snap@2.2.0
[2.1.3]: https://github.com/MetaMask/snaps/compare/@metamask/network-example-snap@2.1.2...@metamask/network-example-snap@2.1.3
[2.1.2]: https://github.com/MetaMask/snaps/compare/@metamask/network-example-snap@2.1.1...@metamask/network-example-snap@2.1.2
[2.1.1]: https://github.com/MetaMask/snaps/compare/@metamask/network-example-snap@2.1.0...@metamask/network-example-snap@2.1.1
[2.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/network-example-snap@2.0.1...@metamask/network-example-snap@2.1.0
[2.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/network-example-snap@2.0.0...@metamask/network-example-snap@2.0.1
[2.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/network-example-snap@1.0.0...@metamask/network-example-snap@2.0.0
[1.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/network-example-snap@0.38.2-flask.1...@metamask/network-example-snap@1.0.0
[0.38.2-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/network-example-snap@0.38.1-flask.1...@metamask/network-example-snap@0.38.2-flask.1
[0.38.1-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/network-example-snap@0.38.0-flask.1...@metamask/network-example-snap@0.38.1-flask.1
[0.38.0-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/network-example-snap@0.37.2-flask.1...@metamask/network-example-snap@0.38.0-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps/releases/tag/@metamask/network-example-snap@0.37.2-flask.1
