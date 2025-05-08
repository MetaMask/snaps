# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.0.0]

### Added

- **BREAKING:** Use `snap_getState`, `snap_setState`, `snap_clearState` methods ([#2916](https://github.com/MetaMask/snaps/pull/2916))
  - The methods previously exposed by this Snap have been renamed with a `legacy_` prefix.

### Changed

- Bump MetaMask dependencies ([#2946](https://github.com/MetaMask/snaps/pull/2946), [#2989](https://github.com/MetaMask/snaps/pull/2989), [#2853](https://github.com/MetaMask/snaps/pull/2853))

## [2.2.3]

### Fixed

- Bump MetaMask dependencies

## [2.2.2]

### Changed

- Use error wrappers ([#2178](https://github.com/MetaMask/snaps/pull/2178))

## [2.2.1]

### Changed

- Remove snap icon ([#2189](https://github.com/MetaMask/snaps/pull/2189))

## [2.2.0]

### Changed

- Use `@metamask/snaps-sdk` package ([#1930](https://github.com/MetaMask/snaps/pull/1930),
  [#1946](https://github.com/MetaMask/snaps/pull/1946), [#1950](https://github.com/MetaMask/snaps/pull/1950),
  [#1949](https://github.com/MetaMask/snaps/pull/1949), [#1954](https://github.com/MetaMask/snaps/pull/1954))
  - This package replaces the `@metamask/snaps-types` and
  - `@metamask/snaps-ui` packages, and is much more lightweight.

## [2.1.0]

### Changed

- Add support for unencrypted storage ([#1915](https://github.com/MetaMask/snaps/pull/1915))

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

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/manage-state-example-snap@3.0.0...HEAD
[3.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/manage-state-example-snap@2.2.3...@metamask/manage-state-example-snap@3.0.0
[2.2.3]: https://github.com/MetaMask/snaps/compare/@metamask/manage-state-example-snap@2.2.2...@metamask/manage-state-example-snap@2.2.3
[2.2.2]: https://github.com/MetaMask/snaps/compare/@metamask/manage-state-example-snap@2.2.1...@metamask/manage-state-example-snap@2.2.2
[2.2.1]: https://github.com/MetaMask/snaps/compare/@metamask/manage-state-example-snap@2.2.0...@metamask/manage-state-example-snap@2.2.1
[2.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/manage-state-example-snap@2.1.0...@metamask/manage-state-example-snap@2.2.0
[2.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/manage-state-example-snap@2.0.1...@metamask/manage-state-example-snap@2.1.0
[2.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/manage-state-example-snap@2.0.0...@metamask/manage-state-example-snap@2.0.1
[2.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/manage-state-example-snap@1.0.0...@metamask/manage-state-example-snap@2.0.0
[1.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/manage-state-example-snap@0.38.1-flask.1...@metamask/manage-state-example-snap@1.0.0
[0.38.1-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/manage-state-example-snap@0.38.0-flask.1...@metamask/manage-state-example-snap@0.38.1-flask.1
[0.38.0-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/manage-state-example-snap@0.37.2-flask.1...@metamask/manage-state-example-snap@0.38.0-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps/releases/tag/@metamask/manage-state-example-snap@0.37.2-flask.1
