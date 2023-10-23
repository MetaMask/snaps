# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.1]
### Uncategorized
- Improve error handling ([#1841](https://github.com/MetaMask/snaps-skunkworks.git/pull/1841))
- Publish preview builds to public NPM registry ([#1873](https://github.com/MetaMask/snaps-skunkworks.git/pull/1873))
- Bump `depcheck` ([#1868](https://github.com/MetaMask/snaps-skunkworks.git/pull/1868))
- Rename `rpc-methods` to `snaps-rpc-methods` ([#1864](https://github.com/MetaMask/snaps-skunkworks.git/pull/1864))
- Support `utf8` encoding for `snap_getFile` ([#1858](https://github.com/MetaMask/snaps-skunkworks.git/pull/1858))
- Add static file API ([#1836](https://github.com/MetaMask/snaps-skunkworks.git/pull/1836))

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

[Unreleased]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/bip32-example-snap@2.0.1...HEAD
[2.0.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/bip32-example-snap@2.0.0...@metamask/bip32-example-snap@2.0.1
[2.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/bip32-example-snap@1.0.0...@metamask/bip32-example-snap@2.0.0
[1.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/bip32-example-snap@0.37.3-flask.1...@metamask/bip32-example-snap@1.0.0
[0.37.3-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/bip32-example-snap@0.37.2-flask.1...@metamask/bip32-example-snap@0.37.3-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/releases/tag/@metamask/bip32-example-snap@0.37.2-flask.1
