# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [4.0.0]
### Changed
- Use `SubtleCrypto` for checksum calculation if available ([#1953](https://github.com/MetaMask/snaps/pull/1953))
  - This reduces the time of the checksum calculation by up to 95% in some
    environments.
- Use `@metamask/snaps-sdk` package ([#1930](https://github.com/MetaMask/snaps/pull/1930),
  [#1946](https://github.com/MetaMask/snaps/pull/1946), [#1950](https://github.com/MetaMask/snaps/pull/1950),
  [#1949](https://github.com/MetaMask/snaps/pull/1949), [#1954](https://github.com/MetaMask/snaps/pull/1954))
  - This package replaces the `@metamask/snaps-types` and
  - `@metamask/snaps-ui` packages, and is much more lightweight.

### Removed
- **BREAKING**: Remove `ValidatedSnapId` and `SnapId` types ([#1930](https://github.com/MetaMask/snaps/pull/1930))
  - `ValidatedSnapId` was moved to the `@metamask/snaps-sdk` package as
    `SnapId`.
  - `SnapId` was an alias of `string`, and is no longer needed.
- **BREAKING**: Remove `SnapError` ([#1949](https://github.com/MetaMask/snaps/pull/1949))
  - This class was moved to the `@metamask/snaps-sdk` package.
- **BREAKING**: Remove `EnumToUnion` type ([#1930](https://github.com/MetaMask/snaps/pull/1930))
  - This type was moved to the `@metamask/snaps-sdk` package.
- **BREAKING**: Remove `RequestedSnapPermissions` type ([#1930](https://github.com/MetaMask/snaps/pull/1930))
  - This type was deprecated, and is now replaced by the `InitialPermissions`
    type from the `@metamask/snaps-sdk` package.

### Fixed
- Include localization files in checksum calculations ([#1956](https://github.com/MetaMask/snaps/pull/1956))

## [3.3.0]
### Added
- Add manifest localization functionality ([#1889](https://github.com/MetaMask/snaps/pull/1889))
- Add `OnHomePage` export ([#1896](https://github.com/MetaMask/snaps/pull/1896))

## [3.2.0]
### Added
- Add support for links in custom UI and notifications ([#1814](https://github.com/MetaMask/snaps/pull/1814))

## [3.1.0]
### Added
- Add static file API ([#1836](https://github.com/MetaMask/snaps/pull/1836), [#1858](https://github.com/MetaMask/snaps/pull/1858))

### Changed
- Update multiple MetaMask dependencies ([#1841](https://github.com/MetaMask/snaps/pull/1841))
- Bump Babel packages from `^7.20.12` to `^7.23.2` ([#1862](https://github.com/MetaMask/snaps/pull/1862))

## [3.0.0]
### Added
- Add keyring export and endowment ([#1787](https://github.com/MetaMask/snaps/pull/1787))
- Add optional `allowedOrigins` field to `endowment:rpc` ([#1822](https://github.com/MetaMask/snaps/pull/1822))
  - This can be used to only accept certain origins in your Snap.

### Changed
- **BREAKING:** Bump minimum Node.js version to `^18.16.0` ([#1741](https://github.com/MetaMask/snaps/pull/1741))

## [2.0.1]
### Changed
- Remove deprecated `endowment:long-running` ([#1751](https://github.com/MetaMask/snaps/pull/1751))

## [2.0.0]
### Changed
- Initial stable release from main branch ([#1757](https://github.com/MetaMask/snaps/pull/1757))

## [0.38.4-flask.1]
### Added
- Add `onNameLookup` export ([#1394](https://github.com/MetaMask/snaps/pull/1394), [#1759](https://github.com/MetaMask/snaps/pull/1759))

### Changed
- Bump `metamask/utils` and `metamask/snaps-registry` ([#1738](https://github.com/MetaMask/snaps/pull/1738))

## [0.38.3-flask.1]
### Changed
- Bump `@metamask/post-message-stream` from 6.1.2 to 7.0.0 ([#1707](https://github.com/MetaMask/snaps/pull/1707), [#1724](https://github.com/MetaMask/snaps/pull/1724))
- Bump `@metamask/utils` and `@metamask/snaps-registry` ([#1694](https://github.com/MetaMask/snaps/pull/1694))

## [0.38.2-flask.1]
### Fixed
- Remove unused dependencies ([#1680](https://github.com/MetaMask/snaps/pull/1680))

## [0.38.1-flask.1]
### Changed
- Update transaction insights response and add severity level enum ([#1653](https://github.com/MetaMask/snaps/pull/1653))
   - Snaps are now able to specify a `severity` for alongside their insights.
   - See [SIP-11](https://metamask.github.io/SIPs/SIPS/sip-11) for more information.

## [0.38.0-flask.1]
### Added
- Add `onInstall` and `onUpdate` lifecycle hooks ([#1643](https://github.com/MetaMask/snaps/pull/1643))

### Changed
- Move source code and snap state back to controller state ([#1634](https://github.com/MetaMask/snaps/pull/1634))
- Bump `semver` to `^7.5.4` ([#1631](https://github.com/MetaMask/snaps/pull/1631))

## [0.37.2-flask.1]
### Changed
- Release package independently ([#1600](https://github.com/MetaMask/snaps/pull/1600))
  - The version of the package no longer needs to match the version of all other
    MetaMask Snaps packages.

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@4.0.0...HEAD
[4.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@3.3.0...@metamask/snaps-utils@4.0.0
[3.3.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@3.2.0...@metamask/snaps-utils@3.3.0
[3.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@3.1.0...@metamask/snaps-utils@3.2.0
[3.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@3.0.0...@metamask/snaps-utils@3.1.0
[3.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@2.0.1...@metamask/snaps-utils@3.0.0
[2.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@2.0.0...@metamask/snaps-utils@2.0.1
[2.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@0.38.4-flask.1...@metamask/snaps-utils@2.0.0
[0.38.4-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@0.38.3-flask.1...@metamask/snaps-utils@0.38.4-flask.1
[0.38.3-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@0.38.2-flask.1...@metamask/snaps-utils@0.38.3-flask.1
[0.38.2-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@0.38.1-flask.1...@metamask/snaps-utils@0.38.2-flask.1
[0.38.1-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@0.38.0-flask.1...@metamask/snaps-utils@0.38.1-flask.1
[0.38.0-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@0.37.2-flask.1...@metamask/snaps-utils@0.38.0-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps/releases/tag/@metamask/snaps-utils@0.37.2-flask.1
