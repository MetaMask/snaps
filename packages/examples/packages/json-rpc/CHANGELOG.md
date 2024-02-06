# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Uncategorized

- BREAKING: Disable source maps by default ([#2166](https://github.com/MetaMask/snaps-skunkworks.git/pull/2166))
- Bump SES and LavaMoat ([#2105](https://github.com/MetaMask/snaps-skunkworks.git/pull/2105))
- Bump @metamask/utils from 8.2.1 to 8.3.0 ([#2100](https://github.com/MetaMask/snaps-skunkworks.git/pull/2100))
- BREAKING: Implement testing framework using Node.js executor ([#1982](https://github.com/MetaMask/snaps-skunkworks.git/pull/1982))
- Bump @metamask/auto-changelog from 3.4.3 to 3.4.4 ([#2054](https://github.com/MetaMask/snaps-skunkworks.git/pull/2054))
- Bump several MetaMask dependencies ([#1964](https://github.com/MetaMask/snaps-skunkworks.git/pull/1964))

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

## [0.37.3-flask.1]

### Fixed

- Remove unused dependencies ([#1680](https://github.com/MetaMask/snaps/pull/1680))

## [0.37.2-flask.1]

### Changed

- Release package independently ([#1600](https://github.com/MetaMask/snaps/pull/1600))
  - The version of the package no longer needs to match the version of all other
    MetaMask Snaps packages.

[Unreleased]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/json-rpc-example-snap@2.1.0...HEAD
[2.1.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/json-rpc-example-snap@2.0.1...@metamask/json-rpc-example-snap@2.1.0
[2.0.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/json-rpc-example-snap@2.0.0...@metamask/json-rpc-example-snap@2.0.1
[2.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/json-rpc-example-snap@1.0.0...@metamask/json-rpc-example-snap@2.0.0
[1.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/json-rpc-example-snap@0.37.3-flask.1...@metamask/json-rpc-example-snap@1.0.0
[0.37.3-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/json-rpc-example-snap@0.37.2-flask.1...@metamask/json-rpc-example-snap@0.37.3-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/releases/tag/@metamask/json-rpc-example-snap@0.37.2-flask.1
