# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Uncategorized

- chore: Move example dependencies to devDependencies ([#3824](https://github.com/MetaMask/snaps/pull/3824))
- release: `139.0.0` ([#3813](https://github.com/MetaMask/snaps/pull/3813))
- chore: Bump @lavamoat/allow-scripts from 3.4.1 to 3.4.2 ([#3809](https://github.com/MetaMask/snaps/pull/3809))
- chore: Bump @lavamoat/allow-scripts from 3.4.0 to 3.4.1 ([#3744](https://github.com/MetaMask/snaps/pull/3744))
- release: `137.0.0` ([#3780](https://github.com/MetaMask/snaps/pull/3780))
- release: `134.0.0` ([#3761](https://github.com/MetaMask/snaps/pull/3761))
- release: `131.0.0` ([#3730](https://github.com/MetaMask/snaps/pull/3730))
- release: `126.0.0` ([#3662](https://github.com/MetaMask/snaps/pull/3662))
- chore: Bump @lavamoat/allow-scripts from 3.3.5 to 3.4.0 ([#3651](https://github.com/MetaMask/snaps/pull/3651))
- chore: Bump @lavamoat/allow-scripts from 3.3.4 to 3.3.5 ([#3612](https://github.com/MetaMask/snaps/pull/3612))

## [2.3.0]

### Added

- Add `onActive` and `onInactive` lifecycle hooks ([#3542](https://github.com/MetaMask/snaps/pull/3542))

## [2.2.0]

### Added

- Add `onStart` functionality ([#3455](https://github.com/MetaMask/snaps/pull/3455))

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

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/lifecycle-hooks-example-snap@2.3.0...HEAD
[2.3.0]: https://github.com/MetaMask/snaps/compare/@metamask/lifecycle-hooks-example-snap@2.2.0...@metamask/lifecycle-hooks-example-snap@2.3.0
[2.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/lifecycle-hooks-example-snap@2.1.3...@metamask/lifecycle-hooks-example-snap@2.2.0
[2.1.3]: https://github.com/MetaMask/snaps/compare/@metamask/lifecycle-hooks-example-snap@2.1.2...@metamask/lifecycle-hooks-example-snap@2.1.3
[2.1.2]: https://github.com/MetaMask/snaps/compare/@metamask/lifecycle-hooks-example-snap@2.1.1...@metamask/lifecycle-hooks-example-snap@2.1.2
[2.1.1]: https://github.com/MetaMask/snaps/compare/@metamask/lifecycle-hooks-example-snap@2.1.0...@metamask/lifecycle-hooks-example-snap@2.1.1
[2.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/lifecycle-hooks-example-snap@2.0.1...@metamask/lifecycle-hooks-example-snap@2.1.0
[2.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/lifecycle-hooks-example-snap@2.0.0...@metamask/lifecycle-hooks-example-snap@2.0.1
[2.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/lifecycle-hooks-example-snap@1.0.0...@metamask/lifecycle-hooks-example-snap@2.0.0
[1.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/lifecycle-hooks-example-snap@0.38.1-flask.1...@metamask/lifecycle-hooks-example-snap@1.0.0
[0.38.1-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/lifecycle-hooks-example-snap@0.38.0-flask.1...@metamask/lifecycle-hooks-example-snap@0.38.1-flask.1
[0.38.0-flask.1]: https://github.com/MetaMask/snaps/releases/tag/@metamask/lifecycle-hooks-example-snap@0.38.0-flask.1
