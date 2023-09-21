# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0]
### Changed
- Initial stable release from main branch ([#1757](https://github.com/MetaMask/snaps/pull/1757))

## [0.39.0-flask.1]
### Added
- Add `onNameLookup` export ([#1394](https://github.com/MetaMask/snaps/pull/1394))

### Changed
- Remove `pump` ([#1730](https://github.com/MetaMask/snaps/pull/1730))
- Bump `metamask/utils` and `metamask/snaps-registry` ([#1738](https://github.com/MetaMask/snaps/pull/1738))

### Fixed
- Sanitize JSON before checking for blocked methods ([#1762](https://github.com/MetaMask/snaps/pull/1762))

## [0.38.3-flask.1]
### Changed
- Bump `@metamask/post-message-stream` from 6.1.2 to 7.0.0 ([#1707](https://github.com/MetaMask/snaps/pull/1707), [#1724](https://github.com/MetaMask/snaps/pull/1724))
- Bump `@metamask/utils` and `@metamask/snaps-registry` ([#1694](https://github.com/MetaMask/snaps/pull/1694))

### Fixed
- Add hardening for `Request`, `Headers`, and `Response` endowments ([#1695](https://github.com/MetaMask/snaps/pull/1695))

## [0.38.2-flask.1]
### Changed
- Bump `ses` to `0.18.7` ([#1666](https://github.com/MetaMask/snaps/pull/1666))

### Fixed
- Remove unused dependencies ([#1680](https://github.com/MetaMask/snaps/pull/1680))

## [0.38.1-flask.1]
### Changed
- Update LavaMoat packages to latest versions ([#1657](https://github.com/MetaMask/snaps/pull/1657))

### Removed
- Remove direct dependency on SES ([#1660](https://github.com/MetaMask/snaps/pull/1660))
  - It's now a dev dependency, as it's only used in development.

### Fixed
- Pass correct scuttle args ([#1654](https://github.com/MetaMask/snaps/pull/1654))

## [0.38.0-flask.1]
### Added
- Add `onInstall` and `onUpdate` lifecycle hooks ([#1643](https://github.com/MetaMask/snaps/pull/1643))
- Unblock `personal_sign` JSON-RPC method ([#1601](https://github.com/MetaMask/snaps/pull/1601))

## [0.37.3-flask.1]
### Fixed
- Fix deployment of the iframe execution environment ([#1627](https://github.com/MetaMask/snaps/pull/1627))

## [0.37.2-flask.1]
### Changed
- Release package independently ([#1600](https://github.com/MetaMask/snaps/pull/1600))
  - The version of the package no longer needs to match the version of all other
    MetaMask Snaps packages.

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@2.0.0...HEAD
[2.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@0.39.0-flask.1...@metamask/snaps-execution-environments@2.0.0
[0.39.0-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@0.38.3-flask.1...@metamask/snaps-execution-environments@0.39.0-flask.1
[0.38.3-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@0.38.2-flask.1...@metamask/snaps-execution-environments@0.38.3-flask.1
[0.38.2-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@0.38.1-flask.1...@metamask/snaps-execution-environments@0.38.2-flask.1
[0.38.1-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@0.38.0-flask.1...@metamask/snaps-execution-environments@0.38.1-flask.1
[0.38.0-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@0.37.3-flask.1...@metamask/snaps-execution-environments@0.38.0-flask.1
[0.37.3-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@0.37.2-flask.1...@metamask/snaps-execution-environments@0.37.3-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps/releases/tag/@metamask/snaps-execution-environments@0.37.2-flask.1
