# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.2]
### Added
- Add `SnapController:snapUninstalled` event ([#1800](https://github.com/MetaMask/snaps/pull/1800))

### Fixed
- Fix some issues with SnapController events ([#1800](https://github.com/MetaMask/snaps/pull/1800))
- Fix an issue where cronjobs would continually be executed on init ([#1790](https://github.com/MetaMask/snaps/pull/1790))

## [2.0.1]
### Changed
- Remove deprecated `endowment:long-running` ([#1751](https://github.com/MetaMask/snaps/pull/1751))

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
- Fix cronjob running on disabled snaps ([#1743](https://github.com/MetaMask/snaps/pull/1743))

## [0.38.3-flask.1]
### Changed
- Bump `@metamask/post-message-stream` from 6.1.2 to 7.0.0 ([#1707](https://github.com/MetaMask/snaps/pull/1707), [#1724](https://github.com/MetaMask/snaps/pull/1724))
- Bump `@metamask/utils` and `@metamask/snaps-registry` ([#1694](https://github.com/MetaMask/snaps/pull/1694))

### Fixed
- Fix unpacking zero byte files from NPM ([#1708](https://github.com/MetaMask/snaps/pull/1708))

## [0.38.2-flask.1]
### Fixed
- Remove unused dependencies ([#1680](https://github.com/MetaMask/snaps/pull/1680))

## [0.38.1-flask.1]
### Fixed
- Fix parallel usage of registry ([#1669](https://github.com/MetaMask/snaps/pull/1669))

## [0.38.0-flask.1]
### Added
- Add `onInstall` and `onUpdate` lifecycle hooks ([#1643](https://github.com/MetaMask/snaps/pull/1643))

### Changed
- Make `updateBlockedSnaps` update the registry ([#1625](https://github.com/MetaMask/snaps/pull/1625))
- Move source code and snap state back to controller state ([#1634](https://github.com/MetaMask/snaps/pull/1634))

## [0.37.2-flask.1]
### Changed
- Release package independently ([#1600](https://github.com/MetaMask/snaps/pull/1600))
  - The version of the package no longer needs to match the version of all other
    MetaMask Snaps packages.

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@2.0.2...HEAD
[2.0.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@2.0.1...@metamask/snaps-controllers@2.0.2
[2.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@2.0.0...@metamask/snaps-controllers@2.0.1
[2.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@0.39.0-flask.1...@metamask/snaps-controllers@2.0.0
[0.39.0-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@0.38.3-flask.1...@metamask/snaps-controllers@0.39.0-flask.1
[0.38.3-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@0.38.2-flask.1...@metamask/snaps-controllers@0.38.3-flask.1
[0.38.2-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@0.38.1-flask.1...@metamask/snaps-controllers@0.38.2-flask.1
[0.38.1-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@0.38.0-flask.1...@metamask/snaps-controllers@0.38.1-flask.1
[0.38.0-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@0.37.2-flask.1...@metamask/snaps-controllers@0.38.0-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps/releases/tag/@metamask/snaps-controllers@0.37.2-flask.1
