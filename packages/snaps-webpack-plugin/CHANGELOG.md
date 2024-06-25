# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [4.0.1]
### Fixed
- Fix minor build configuration problems ([#2220](https://github.com/MetaMask/snaps/pull/2220))

## [4.0.0]
### Changed
- **BREAKING:** Update ESM build to be fully compliant with the ESM standard ([#2210](https://github.com/MetaMask/snaps/pull/2210))

## [3.2.0]
### Added
- Add a manifest warning when no icon is found and when icon is not square ([#2185](https://github.com/MetaMask/snaps/pull/2185))

### Changed
- Update warning messages ([#2186](https://github.com/MetaMask/snaps/pull/2186))
- Bump several MetaMask dependencies ([#2054](https://github.com/MetaMask/snaps/pull/2054), [#2100](https://github.com/MetaMask/snaps/pull/2100), [#2105](https://github.com/MetaMask/snaps/pull/2105), [#2173](https://github.com/MetaMask/snaps/pull/2173))

## [3.1.1]
### Changed
- Bump several MetaMask dependencies ([#1964](https://github.com/MetaMask/snaps/pull/1964))

## [3.1.0]
### Changed
- Use `@metamask/snaps-sdk` package ([#1949](https://github.com/MetaMask/snaps/pull/1949))
  - This package replaces the `@metamask/snaps-types` and
  - `@metamask/snaps-ui` packages.

## [3.0.1]
### Changed
- Update multiple MetaMask dependencies ([#1841](https://github.com/MetaMask/snaps/pull/1841))

## [3.0.0]
### Changed
- **BREAKING:** Bump minimum Node.js version to `^18.16.0` ([#1741](https://github.com/MetaMask/snaps/pull/1741))

## [2.0.1]
### Changed
- Improve error messaging ([#1798](https://github.com/MetaMask/snaps/pull/1798))

## [2.0.0]
### Changed
- Initial stable release from main branch ([#1757](https://github.com/MetaMask/snaps/pull/1757))

## [0.37.4-flask.1]
### Changed
- Bump `metamask/utils` and `metamask/snaps-registry` ([#1738](https://github.com/MetaMask/snaps/pull/1738), [#1694](https://github.com/MetaMask/snaps/pull/1694))

## [0.37.3-flask.1]
### Fixed
- Remove unused dependencies ([#1680](https://github.com/MetaMask/snaps/pull/1680))

## [0.37.2-flask.1]
### Changed
- Release package independently ([#1600](https://github.com/MetaMask/snaps/pull/1600))
  - The version of the package no longer needs to match the version of all other
    MetaMask Snaps packages.

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-webpack-plugin@4.0.1...HEAD
[4.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-webpack-plugin@4.0.0...@metamask/snaps-webpack-plugin@4.0.1
[4.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-webpack-plugin@3.2.0...@metamask/snaps-webpack-plugin@4.0.0
[3.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-webpack-plugin@3.1.1...@metamask/snaps-webpack-plugin@3.2.0
[3.1.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-webpack-plugin@3.1.0...@metamask/snaps-webpack-plugin@3.1.1
[3.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-webpack-plugin@3.0.1...@metamask/snaps-webpack-plugin@3.1.0
[3.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-webpack-plugin@3.0.0...@metamask/snaps-webpack-plugin@3.0.1
[3.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-webpack-plugin@2.0.1...@metamask/snaps-webpack-plugin@3.0.0
[2.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-webpack-plugin@2.0.0...@metamask/snaps-webpack-plugin@2.0.1
[2.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-webpack-plugin@0.37.4-flask.1...@metamask/snaps-webpack-plugin@2.0.0
[0.37.4-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-webpack-plugin@0.37.3-flask.1...@metamask/snaps-webpack-plugin@0.37.4-flask.1
[0.37.3-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-webpack-plugin@0.37.2-flask.1...@metamask/snaps-webpack-plugin@0.37.3-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps/releases/tag/@metamask/snaps-webpack-plugin@0.37.2-flask.1
