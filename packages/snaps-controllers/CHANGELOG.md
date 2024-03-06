# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [6.0.2]
### Changed
- Improve timeout handling when the execution environment fails to load ([#2242](https://github.com/MetaMask/snaps/pull/2242))

## [6.0.1]
### Fixed
- Fix minor build configuration problems ([#2220](https://github.com/MetaMask/snaps/pull/2220))

## [6.0.0]
### Changed
- **BREAKING:** Update ESM build to be fully compliant with the ESM standard ([#2210](https://github.com/MetaMask/snaps/pull/2210))
- **BREAKING:** Move Node.js exports to separate export ([#2210](https://github.com/MetaMask/snaps/pull/2210))
  - The default export is now browser-compatible.
  - Node.js APIs can be imported from `<package>/node`.
- Bump `@metamask/rpc-errors` to `^6.2.1` ([#2209](https://github.com/MetaMask/snaps/pull/2209))

### Fixed
- Add sizing limits for custom UI ([#2199](https://github.com/MetaMask/snaps/pull/2199))

## [5.0.1]
### Fixed
- Fix issue installing non-allowlisted Snaps in allowlist mode ([#2196](https://github.com/MetaMask/snaps/pull/2196))

## [5.0.0]
### Added
- Add support for dynamic user interfaces ([#1465](https://github.com/MetaMask/snaps/pull/1465), [#2126](https://github.com/MetaMask/snaps/pull/2126), [#2144](https://github.com/MetaMask/snaps/pull/2144), [#2152](https://github.com/MetaMask/snaps/pull/2152), [#2143](https://github.com/MetaMask/snaps/pull/2143))
- Add support for Snap defined execution timeouts ([#2098](https://github.com/MetaMask/snaps/pull/2098))
  - A Snap can now define `maxRequestTime` to extend or shorten its execution timeout.
- Add `WebViewExecutionService` for mobile execution ([#2005](https://github.com/MetaMask/snaps/pull/2005))

### Changed
- Loosen allowlist requirements ([#1672](https://github.com/MetaMask/snaps/pull/1672))
  - Snaps with certain permissions can now be installed without being allowlisted.
- Reintroduce `DecompressionStream` for improved installation performance ([#2110](https://github.com/MetaMask/snaps/pull/2110))
- Bump `tar-stream` ([#2116](https://github.com/MetaMask/snaps/pull/2116))
  - This fixes a problem where Snaps would sometimes fail to download from NPM.
- Bump several MetaMask dependencies ([#2129](https://github.com/MetaMask/snaps/pull/2129), [#2132](https://github.com/MetaMask/snaps/pull/2132), [#2130](https://github.com/MetaMask/snaps/pull/2130), [#2139](https://github.com/MetaMask/snaps/pull/2139), [#2142](https://github.com/MetaMask/snaps/pull/2142))
- Pass localized snap name to SubjectMetadataController ([#2157](https://github.com/MetaMask/snaps/pull/2157))

### Removed
- **BREAKING:** Remove endowment permission specifications from this package ([#2155](https://github.com/MetaMask/snaps/pull/2155))
  - They can now be found in `snaps-rpc-methods`.

## [4.1.0]
### Added
- Add support for signature insights ([#2074](https://github.com/MetaMask/snaps/pull/2074))
- Add support for initial connections ([#2048](https://github.com/MetaMask/snaps/pull/2048))
- Add support for preinstalled snaps ([#2008](https://github.com/MetaMask/snaps/pull/2008))
- Add additional install events ([#2087](https://github.com/MetaMask/snaps/pull/2087))

### Changed
- Bump several MetaMask dependencies ([#2086](https://github.com/MetaMask/snaps/pull/2086), [#2100](https://github.com/MetaMask/snaps/pull/2100))

## [4.0.0]
### Changed
- **BREAKING:** Remove `:snapAdded` event ([#2073](https://github.com/MetaMask/snaps/pull/2073))
- **BREAKING:** Remove `:snapRemoved` event ([#2076](https://github.com/MetaMask/snaps/pull/2076))
- Populate subject metadata when snaps are added to state ([#2069](https://github.com/MetaMask/snaps/pull/2069))

## [3.6.0]
### Changed
- Revert usage of `DecompressionStream` ([#2052](https://github.com/MetaMask/snaps/pull/2052))
- Refactor `NpmLocation` class ([#2038](https://github.com/MetaMask/snaps/pull/2038))
  - Most logic is now located in `BaseNpmLocation`, making it easier to extend without duplication.
- Bump several MetaMask dependencies ([#2053](https://github.com/MetaMask/snaps/pull/2053), [#2061](https://github.com/MetaMask/snaps/pull/2061), [#2064](https://github.com/MetaMask/snaps/pull/2064), [#2065](https://github.com/MetaMask/snaps/pull/2065), [#2067](https://github.com/MetaMask/snaps/pull/2067))

### Removed
- Remove support for object-like syntax for cronjobs ([#2057](https://github.com/MetaMask/snaps/pull/2057))
  - Since this never worked in the first place we aren't marking it as breaking.

## [3.5.1]
### Changed
- Improve `SnapController` constructor types ([#2023](https://github.com/MetaMask/snaps/pull/2023))
- Bump `snaps-registry` ([#2020](https://github.com/MetaMask/snaps/pull/2020))

## [3.5.0]
### Changed
- Reduce memory usage by removing source code and state from runtime ([#2009](https://github.com/MetaMask/snaps/pull/2009))
- Improve base64 encoding/decoding speeds ([#1985](https://github.com/MetaMask/snaps/pull/1985))
- Use `DecompressionStream` for NPM fetching when available ([#1971](https://github.com/MetaMask/snaps/pull/1971))
- Bump several MetaMask dependencies ([#1989](https://github.com/MetaMask/snaps/pull/1989), [#1993](https://github.com/MetaMask/snaps/pull/1993), [#1987](https://github.com/MetaMask/snaps/pull/1987), [#1983](https://github.com/MetaMask/snaps/pull/1983))

### Fixed
- Fix idle snap timeout for unused snap ([#2010](https://github.com/MetaMask/snaps/pull/2010))

## [3.4.1]
### Changed
- Bump several MetaMask dependencies ([#1964](https://github.com/MetaMask/snaps/pull/1964), [#1961](https://github.com/MetaMask/snaps/pull/1961))

### Fixed
- Fix a few issues with passing non-JSON-serializable values ([#1974](https://github.com/MetaMask/snaps/pull/1974))

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

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@6.0.2...HEAD
[6.0.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@6.0.1...@metamask/snaps-controllers@6.0.2
[6.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@6.0.0...@metamask/snaps-controllers@6.0.1
[6.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@5.0.1...@metamask/snaps-controllers@6.0.0
[5.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@5.0.0...@metamask/snaps-controllers@5.0.1
[5.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@4.1.0...@metamask/snaps-controllers@5.0.0
[4.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@4.0.0...@metamask/snaps-controllers@4.1.0
[4.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@3.6.0...@metamask/snaps-controllers@4.0.0
[3.6.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@3.5.1...@metamask/snaps-controllers@3.6.0
[3.5.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@3.5.0...@metamask/snaps-controllers@3.5.1
[3.5.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-controllers@3.4.1...@metamask/snaps-controllers@3.5.0
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
