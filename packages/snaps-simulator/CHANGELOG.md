# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulator@1.0.0...HEAD
[1.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulator@0.38.1-flask.1...@metamask/snaps-simulator@1.0.0
[0.38.1-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulator@0.38.0-flask.1...@metamask/snaps-simulator@0.38.1-flask.1
[0.38.0-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulator@0.37.2-flask.1...@metamask/snaps-simulator@0.38.0-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps/releases/tag/@metamask/snaps-simulator@0.37.2-flask.1
