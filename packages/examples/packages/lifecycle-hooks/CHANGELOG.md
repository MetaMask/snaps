# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.1.1]
### Uncategorized
- Add a manifest warning when no icon is found and when icon is not 1:1 ([#2185](https://github.com/MetaMask/snaps/pull/2185))
- Remove icons from package.json ([#2190](https://github.com/MetaMask/snaps/pull/2190))
- Delete example snap icons ([#2189](https://github.com/MetaMask/snaps/pull/2189))
- Optimise CLI Webpack configuration ([#2175](https://github.com/MetaMask/snaps/pull/2175))
- Update several LavaMoat packages ([#2173](https://github.com/MetaMask/snaps/pull/2173))
- BREAKING: Disable source maps by default ([#2166](https://github.com/MetaMask/snaps/pull/2166))
- Add support for dynamic user interfaces ([#1465](https://github.com/MetaMask/snaps/pull/1465))
- Bump SES and LavaMoat ([#2105](https://github.com/MetaMask/snaps/pull/2105))
- Bump @metamask/utils from 8.2.1 to 8.3.0 ([#2100](https://github.com/MetaMask/snaps/pull/2100))
- Add `snap_getClientStatus` ([#2051](https://github.com/MetaMask/snaps/pull/2051))
- Signature insights ([#2074](https://github.com/MetaMask/snaps/pull/2074))
- Bump @metamask/auto-changelog from 3.4.3 to 3.4.4 ([#2054](https://github.com/MetaMask/snaps/pull/2054))
- Export error wrappers ([#2043](https://github.com/MetaMask/snaps/pull/2043))
- Add image fetching utility functions ([#1995](https://github.com/MetaMask/snaps/pull/1995))
- Add row and address component ([#1968](https://github.com/MetaMask/snaps/pull/1968))
- Bump several MetaMask dependencies ([#1964](https://github.com/MetaMask/snaps/pull/1964))
- Add Snap error wrappers of JSON-RPC errors ([#1924](https://github.com/MetaMask/snaps/pull/1924))

## [2.1.0]
### Changed
- Use `@metamask/snaps-sdk` package ([#1946](https://github.com/MetaMask/snaps/pull/1946), [#1954](https://github.com/MetaMask/snaps/pull/1954))
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
- Add lifecycle hooks example snap ([#1645](https://github.com/MetaMask/snaps/pull/1645))
  - This snap demonstrates how to use the `onInstall` and `onUpdate` lifecycle hooks.

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/lifecycle-hooks-example-snap@2.1.1...HEAD
[2.1.1]: https://github.com/MetaMask/snaps/compare/@metamask/lifecycle-hooks-example-snap@2.1.0...@metamask/lifecycle-hooks-example-snap@2.1.1
[2.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/lifecycle-hooks-example-snap@2.0.1...@metamask/lifecycle-hooks-example-snap@2.1.0
[2.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/lifecycle-hooks-example-snap@2.0.0...@metamask/lifecycle-hooks-example-snap@2.0.1
[2.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/lifecycle-hooks-example-snap@1.0.0...@metamask/lifecycle-hooks-example-snap@2.0.0
[1.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/lifecycle-hooks-example-snap@0.38.1-flask.1...@metamask/lifecycle-hooks-example-snap@1.0.0
[0.38.1-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/lifecycle-hooks-example-snap@0.38.0-flask.1...@metamask/lifecycle-hooks-example-snap@0.38.1-flask.1
[0.38.0-flask.1]: https://github.com/MetaMask/snaps/releases/tag/@metamask/lifecycle-hooks-example-snap@0.38.0-flask.1
