# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.4.1]
### Changed
- Bump several MetaMask dependencies ([#1964](https://github.com/MetaMask/snaps/pull/1964), [#1961](https://github.com/MetaMask/snaps/pull/1961))

### Fixed
- Fix a few issues with passing non-serializable JSON ([#1974](https://github.com/MetaMask/snaps/pull/1974))

## [3.4.0]
### Changed
- Use `SubtleCrypto` for checksum calculation if available ([#1953](https://github.com/MetaMask/snaps/pull/1953))
  - This reduces the time of the checksum calculation by up to 95% in some
    environments.
- Use `@metamask/snaps-sdk` package ([#1930](https://github.com/MetaMask/snaps/pull/1930), [#1949](https://github.com/MetaMask/snaps/pull/1949))
  - This package replaces the `@metamask/snaps-types` and
  - `@metamask/snaps-ui` packages.

### Fixed
- Fix support for transaction insight Snaps returning `null` ([#1952](https://github.com/MetaMask/snaps/pull/1952))

## [3.3.0]
### Added
- Add manifest localization functionality ([#1889](https://github.com/MetaMask/snaps/pull/1889))
- Add support for unencrypted storage using `snap_manageState` ([#1902](https://github.com/MetaMask/snaps/pull/1902))
- Add `OnHomePage` export ([#1896](https://github.com/MetaMask/snaps/pull/1896))

## [3.2.0]
### Added
- Add support for links in custom UI and notifications ([#1814](https://github.com/MetaMask/snaps/pull/1814))

### Fixed
- Fix an issue where snaps throwing a `SnapError` would be allowed to run for longer than expected ([#1897](https://github.com/MetaMask/snaps/pull/1897))

## [3.1.1]
### Fixed
- Fix a few issues with allowlist version resolving ([#1888](https://github.com/MetaMask/snaps/pull/1888))

## [3.1.0]
### Added
- Add static file API ([#1836](https://github.com/MetaMask/snaps/pull/1836))
  - This adds a `snap_getFile` method, which Snaps can use to load files.
- Add `origin` parameter to `snapInstalled` and `snapUpdated` events ([#1867](https://github.com/MetaMask/snaps/pull/1867))

### Changed
- Improve error handling ([#1841](https://github.com/MetaMask/snaps/pull/1841))
  - Snaps can now throw a `SnapError`, without causing the Snap to crash.
- Bump `tar-stream` from `^2.2.0` to `^3.1.6` ([#1853](https://github.com/MetaMask/snaps/pull/1853))
- Make `snaps-execution-environments` an optional peer dependency ([#1845](https://github.com/MetaMask/snaps/pull/1845))
- Remove snap errors from state ([#1837](https://github.com/MetaMask/snaps/pull/1837))

### Fixed
- Try to match requested versions with an allowlisted version ([#1877](https://github.com/MetaMask/snaps/pull/1877))
- Improve performance when installing snaps with a static version ([#1878](https://github.com/MetaMask/snaps/pull/1878))
- Stop persisting snaps in the installing state ([#1876](https://github.com/MetaMask/snaps/pull/1876))

## [3.0.0]
### Added
- Add keyring export and endowment ([#1787](https://github.com/MetaMask/snaps/pull/1787))
- Add optional `allowedOrigins` field to `endowment:rpc` ([#1822](https://github.com/MetaMask/snaps/pull/1822))
  - This can be used to only accept certain origins in your Snap.

### Changed
- **BREAKING:** Bump minimum Node.js version to `^18.16.0` ([#1741](https://github.com/MetaMask/snaps/pull/1741))

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

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@3.4.1...HEAD
[3.4.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@3.4.0...@metamask/snaps-controllers@3.4.1
[3.4.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@3.3.0...@metamask/snaps-controllers@3.4.0
[3.3.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@3.2.0...@metamask/snaps-controllers@3.3.0
[3.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@3.1.1...@metamask/snaps-controllers@3.2.0
[3.1.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@3.1.0...@metamask/snaps-controllers@3.1.1
[3.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@3.0.0...@metamask/snaps-controllers@3.1.0
[3.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@2.0.2...@metamask/snaps-controllers@3.0.0
[2.0.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@2.0.1...@metamask/snaps-controllers@2.0.2
[2.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@2.0.0...@metamask/snaps-controllers@2.0.1
[2.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@0.39.0-flask.1...@metamask/snaps-controllers@2.0.0
[0.39.0-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@0.38.3-flask.1...@metamask/snaps-controllers@0.39.0-flask.1
[0.38.3-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@0.38.2-flask.1...@metamask/snaps-controllers@0.38.3-flask.1
[0.38.2-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@0.38.1-flask.1...@metamask/snaps-controllers@0.38.2-flask.1
[0.38.1-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@0.38.0-flask.1...@metamask/snaps-controllers@0.38.1-flask.1
[0.38.0-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@0.37.2-flask.1...@metamask/snaps-controllers@0.38.0-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps/releases/tag/@metamask/snaps-controllers@0.37.2-flask.1
