# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.4.3]
### Changed
- Bump several MetaMask dependencies ([#1999](https://github.com/MetaMask/snaps/pull/1999), [#2065](https://github.com/MetaMask/snaps/pull/2065), [#2064](https://github.com/MetaMask/snaps/pull/2064), [#2069](https://github.com/MetaMask/snaps/pull/2069), [#2054](https://github.com/MetaMask/snaps/pull/2054), [#2086](https://github.com/MetaMask/snaps/pull/2086), [#2100](https://github.com/MetaMask/snaps/pull/2100))

## [2.4.2]
### Changed
- Bump several MetaMask dependencies ([#1989](https://github.com/MetaMask/snaps/pull/1989))

## [2.4.1]
### Changed
- Bump several MetaMask dependencies ([#1964](https://github.com/MetaMask/snaps/pull/1964))

## [2.4.0]
### Changed
- Use `SubtleCrypto` for checksum calculation if available ([#1953](https://github.com/MetaMask/snaps/pull/1953))
  - This reduces the time of the checksum calculation by up to 95% in some
    environments.
- Use `@metamask/snaps-sdk` package ([#1930](https://github.com/MetaMask/snaps/pull/1930),
  [#1949](https://github.com/MetaMask/snaps/pull/1949), [#1954](https://github.com/MetaMask/snaps/pull/1954))
  - This package replaces the `@metamask/snaps-types` and
  - `@metamask/snaps-ui` packages.
- Bump `@metamask/eth-json-rpc-middleware` from `12.0.0` to `12.0.1` ([#1935](https://github.com/MetaMask/snaps/pull/1935))

## [2.3.0]
### Added
- Add manifest localization functionality ([#1889](https://github.com/MetaMask/snaps/pull/1889))
- Add support for unencrypted storage using `snap_manageState` ([#1902](https://github.com/MetaMask/snaps/pull/1902))

## [2.2.0]
### Added
- Add support for links in custom UI ([#1814](https://github.com/MetaMask/snaps/pull/1814))

## [2.1.0]
### Added
- Add support for the static file API ([#1836](https://github.com/MetaMask/snaps/pull/1836))

### Changed
- Improve error handling ([#1841](https://github.com/MetaMask/snaps/pull/1841))
  - Errors shown in the simulator now more accurately reflect the error thrown by the Snap.

## [2.0.0]
### Added
- Add image component ([#1783](https://github.com/MetaMask/snaps/pull/1783))

### Changed
- **BREAKING:** Bump minimum Node.js version to `^18.16.0` ([#1741](https://github.com/MetaMask/snaps/pull/1741))

## [1.0.0]
### Changed
- Initial stable release from main branch ([#1757](https://github.com/MetaMask/snaps/pull/1757))

## [0.38.1-flask.1]
### Added
- Add basic support for account RPC methods in snaps simulator ([#1710](https://github.com/MetaMask/snaps/pull/1710))

### Changed
- Remove `pump` ([#1730](https://github.com/MetaMask/snaps/pull/1730))
- Bump `metamask/utils` and `metamask/snaps-registry` ([#1738](https://github.com/MetaMask/snaps/pull/1738), [#1694](https://github.com/MetaMask/snaps/pull/1694))
- Bump @metamask/eth-json-rpc-middleware from 11.0.1 to 11.0.2 ([#1735](https://github.com/MetaMask/snaps/pull/1735))


### Fixed
- Fix error when using single quotes in UI builder ([#1709](https://github.com/MetaMask/snaps/pull/1709))
- Fix fallback icon in snaps simulator ([#1726](https://github.com/MetaMask/snaps/pull/1726))

## [0.38.0-flask.1]
### Added
- Add support for `snap_getLocale` JSON-RPC method ([#1684](https://github.com/MetaMask/snaps/pull/1684))

### Fixed
- Remove unused dependencies ([#1680](https://github.com/MetaMask/snaps/pull/1680))

## [0.37.2-flask.1]
### Changed
- Release package independently ([#1600](https://github.com/MetaMask/snaps/pull/1600))
  - The version of the package no longer needs to match the version of all other
    MetaMask Snaps packages.

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulator@2.4.3...HEAD
[2.4.3]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulator@2.4.2...@metamask/snaps-simulator@2.4.3
[2.4.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulator@2.4.1...@metamask/snaps-simulator@2.4.2
[2.4.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulator@2.4.0...@metamask/snaps-simulator@2.4.1
[2.4.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulator@2.3.0...@metamask/snaps-simulator@2.4.0
[2.3.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulator@2.2.0...@metamask/snaps-simulator@2.3.0
[2.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulator@2.1.0...@metamask/snaps-simulator@2.2.0
[2.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulator@2.0.0...@metamask/snaps-simulator@2.1.0
[2.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulator@1.0.0...@metamask/snaps-simulator@2.0.0
[1.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulator@0.38.1-flask.1...@metamask/snaps-simulator@1.0.0
[0.38.1-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulator@0.38.0-flask.1...@metamask/snaps-simulator@0.38.1-flask.1
[0.38.0-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulator@0.37.2-flask.1...@metamask/snaps-simulator@0.38.0-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps/releases/tag/@metamask/snaps-simulator@0.37.2-flask.1
