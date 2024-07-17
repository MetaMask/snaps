# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [7.8.0]
### Added
- Move `serialiseJsx` function from `snaps-jest` to `snaps-utils` ([#2409](https://github.com/metamask/snaps/pull/2409))

### Changed
- Bump `@metamask/base-controller` from `^6.0.0` to `^6.0.1` ([#2445](https://github.com/MetaMask/snaps/pull/2445))
- Bump `@metamask/key-tree` from `^9.1.1` to `^9.1.2` ([#2445](https://github.com/MetaMask/snaps/pull/2445))
- Bump `@metamask/permission-controller` from `^10.0.0` to `^10.0.1` ([#2445](https://github.com/MetaMask/snaps/pull/2445))
- Bump `@metamask/rpc-errors` from `^6.2.1` to `^6.3.1` ([#2445](https://github.com/MetaMask/snaps/pull/2445))
- Bump `@metamask/snaps-registry` from `^3.1.0` to `^3.2.1` ([#2445](https://github.com/MetaMask/snaps/pull/2445))
- Bump `@metamask/utils` from `^8.3.0` to `^9.1.0` ([#2445](https://github.com/MetaMask/snaps/pull/2445))

### Fixed
- Replace `superstruct` with ESM-compatible `@metamask/superstruct` `^3.1.0` ([#2445](https://github.com/MetaMask/snaps/pull/2445))
  - This fixes the issue of this package being unusable by any TypeScript project that uses `Node16` or `NodeNext` as its `moduleResolution` option.
- Fix `allowedOrigins` bypass caused by unterminated regex ([#2576](https://github.com/metamask/snaps/pull/2576))

## [7.7.0]
### Added
- Support conditional children in most JSX components ([#2506](https://github.com/MetaMask/snaps/pull/2506))
- Support additional components inside forms ([#2497](https://github.com/MetaMask/snaps/pull/2497))

### Fixed
- Improve validation of `endowment:rpc` ([#2512](https://github.com/MetaMask/snaps/pull/2512))

## [7.6.0]
### Added
- Support nested children in JSX ([#2482](https://github.com/MetaMask/snaps/pull/2482))

### Changed
- Update `onNameLookup` response to include `domainName` ([#2484](https://github.com/MetaMask/snaps/pull/2484))
- Bump MetaMask dependencies ([#2460](https://github.com/MetaMask/snaps/pull/2460))

### Fixed
- Fix a problem with converting legacy UIs that used `row()` ([#2486](https://github.com/MetaMask/snaps/pull/2486))
- Revert requiring at least one child in JSX components ([#2470](https://github.com/MetaMask/snaps/pull/2470))

## [7.5.0]
### Added
- Allow wildcards in `allowedOrigins` ([#2458](https://github.com/MetaMask/snaps/pull/2458))
- Add `hidden` flag for preinstalled Snaps ([#2463](https://github.com/MetaMask/snaps/pull/2463))

### Fixed
- Require at least 1 child in JSX components ([#2466](https://github.com/MetaMask/snaps/pull/2466))

## [7.4.1]
### Fixed
- Fix invalid `@metamask/snaps-sdk` imports ([#2452](https://github.com/MetaMask/snaps/pull/2452))

## [7.4.0]
### Added
- Add support for BIP-32-Ed25519 / CIP-3 key derivation ([#2408](https://github.com/MetaMask/snaps/pull/2408))

## Fixed

- Fix build producing invalid JSX types ([#2410](https://github.com/MetaMask/snaps/pull/2410))

## [7.3.0]
### Added
- Add JSX support for custom UI ([#2258](https://github.com/MetaMask/snaps/pull/2258), [#2383](https://github.com/MetaMask/snaps/pull/2383))
  - This adds utility functions for working with JSX in Snaps.

### Changed
- Bump `@metamask/base-controller` from `5.0.1` to `5.0.2` ([#2375](https://github.com/MetaMask/snaps/pull/2375))

## [7.2.0]
### Added
- Add `getJsonSizeUnsafe` ([#2342](https://github.com/MetaMask/snaps/pull/2342))

## [7.1.0]
### Added
- Add derivation path for Nimiq ([#2309](https://github.com/MetaMask/snaps/pull/2309))

### Fixed
- Disable GitHub flavored Markdown when lexing ([#2317](https://github.com/MetaMask/snaps/pull/2317))

## [7.0.4]
### Changed
- Bump MetaMask dependencies ([#2270](https://github.com/MetaMask/snaps/pull/2270))

### Fixed
- Allow `maxRequestTime` on `endowment:rpc` ([#2291](https://github.com/MetaMask/snaps/pull/2291))

## [7.0.3]
### Changed
- Update markdown parsing for better link validation ([#2261](https://github.com/MetaMask/snaps/pull/2261))
- Bump `@metamask/snaps-registry` to `^3.0.1` ([#2255](https://github.com/MetaMask/snaps/pull/2255))

## [7.0.2]
### Fixed
- Remove usage of `Buffer` from browser entrypoint ([#2238](https://github.com/MetaMask/snaps/pull/2238))

## [7.0.1]
### Fixed
- Fix minor build configuration problems ([#2220](https://github.com/MetaMask/snaps/pull/2220))
- Fix regex for HTML comment tokens ([#2222](https://github.com/MetaMask/snaps/pull/2222))

## [7.0.0]
### Changed
- **BREAKING:** Update ESM build to be fully compliant with the ESM standard ([#2210](https://github.com/MetaMask/snaps/pull/2210))
- **BREAKING:** Move Node.js exports to separate export ([#2210](https://github.com/MetaMask/snaps/pull/2210))
  - The default export is now browser-compatible.
  - Node.js APIs can be imported from `<package>/node`.
- Bump `@metamask/rpc-errors` to `^6.2.1` ([#2209](https://github.com/MetaMask/snaps/pull/2209))

### Removed
- **BREAKING:** Move `file` struct to CLI ([#2207](https://github.com/MetaMask/snaps/pull/2207))
  - The previously exported `file` struct can now be found in `@metamask/snaps-cli`.

### Fixed
- Add sizing limits for custom UI ([#2199](https://github.com/MetaMask/snaps/pull/2199))
- Properly validate links contained in rows ([#2205](https://github.com/MetaMask/snaps/pull/2205))

## [6.1.0]
### Added
- Add a manifest warning when no icon is found and when icon is not square ([#2185](https://github.com/MetaMask/snaps/pull/2185))

## [6.0.0]
### Added
- Add support for dynamic user interfaces ([#1465](https://github.com/MetaMask/snaps/pull/1465), [#2126](https://github.com/MetaMask/snaps/pull/2126))
- Add support for snap defined execution timeouts ([#2098](https://github.com/MetaMask/snaps/pull/2098))

### Changed
- **BREAKING:** Update name lookup type validation ([#2113](https://github.com/MetaMask/snaps/pull/2113))
  - The return value and the permission format has changed, see [SIP-12](https://metamask.github.io/SIPs/SIPS/sip-12) for more details.
- Speed up eval-worker for improved CLI performance ([#2147](https://github.com/MetaMask/snaps/pull/2147))
- Update MetaMask dependencies ([#2132](https://github.com/MetaMask/snaps/pull/2132), [#2142](https://github.com/MetaMask/snaps/pull/2142))

### Fixed
- Fix initial permissions types ([#2111](https://github.com/MetaMask/snaps/pull/2111))

## [5.2.0]
### Added
- Add support for initial connections ([#2048](https://github.com/MetaMask/snaps/pull/2048))
- Add support for preinstalled snaps ([#2008](https://github.com/MetaMask/snaps/pull/2008))
- Add support for signature insights ([#2074](https://github.com/MetaMask/snaps/pull/2074))

### Changed
- Bump several MetaMask dependencies ([#2086](https://github.com/MetaMask/snaps/pull/2086), [#2100](https://github.com/MetaMask/snaps/pull/2100))

## [5.1.2]
### Fixed
- Fix missing `global` during snap evaluation ([#2072](https://github.com/MetaMask/snaps/pull/2072))

## [5.1.1]
### Changed
- Fix missing export ([#2045](https://github.com/MetaMask/snaps/pull/2045))
- Bump `@metamask/permission-controller` from `6.0.0` to `7.0.0` ([#2064](https://github.com/MetaMask/snaps/pull/2064))

### Removed
- Remove support for object-like syntax for cronjobs ([#2057](https://github.com/MetaMask/snaps/pull/2057))
  - Since this never worked in the first place we aren't marking it as breaking.

## [5.1.0]
### Added
- Add `getSnapDerivationPathName` and `getSlip44ProtocolName` to be shared across clients ([#2033](https://github.com/MetaMask/snaps/pull/2033))

### Changed
- Bump `snaps-registry` ([#2020](https://hub.com/MetaMask/snaps/pull/2020))

## [5.0.1]
### Changed
- Improve base64 encoding/decoding speeds ([#1985](https://github.com/MetaMask/snaps/pull/1985))
- Bump several MetaMask dependencies ([#1989](https://github.com/MetaMask/snaps/pull/1989), [#1993](https://github.com/MetaMask/snaps/pull/1993))

## [5.0.0]
### Changed
- Bump several MetaMask dependencies ([#1964](https://github.com/MetaMask/snaps/pull/1964))

### Removed
- **BREAKING:** Move `enumValue`, `literal` and `union` to `snaps-sdk` ([#1968](https://github.com/MetaMask/snaps/pull/1968))

### Fixed
- Fix issues generating checksum with binary auxiliary files ([#1975](https://github.com/MetaMask/snaps/pull/1975))

## [4.0.1]
### Fixed
- Change `validateTextLinks` to only get URL in markdown links ([#1914](https://github.com/MetaMask/snaps/pull/1914))

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

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@7.8.0...HEAD
[7.8.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@7.7.0...@metamask/snaps-utils@7.8.0
[7.7.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@7.6.0...@metamask/snaps-utils@7.7.0
[7.6.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@7.5.0...@metamask/snaps-utils@7.6.0
[7.5.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@7.4.1...@metamask/snaps-utils@7.5.0
[7.4.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@7.4.0...@metamask/snaps-utils@7.4.1
[7.4.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@7.3.0...@metamask/snaps-utils@7.4.0
[7.3.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@7.2.0...@metamask/snaps-utils@7.3.0
[7.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@7.1.0...@metamask/snaps-utils@7.2.0
[7.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@7.0.4...@metamask/snaps-utils@7.1.0
[7.0.4]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@7.0.3...@metamask/snaps-utils@7.0.4
[7.0.3]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@7.0.2...@metamask/snaps-utils@7.0.3
[7.0.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@7.0.1...@metamask/snaps-utils@7.0.2
[7.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@7.0.0...@metamask/snaps-utils@7.0.1
[7.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@6.1.0...@metamask/snaps-utils@7.0.0
[6.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@6.0.0...@metamask/snaps-utils@6.1.0
[6.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@5.2.0...@metamask/snaps-utils@6.0.0
[5.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@5.1.2...@metamask/snaps-utils@5.2.0
[5.1.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@5.1.1...@metamask/snaps-utils@5.1.2
[5.1.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@5.1.0...@metamask/snaps-utils@5.1.1
[5.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@5.0.1...@metamask/snaps-utils@5.1.0
[5.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@5.0.0...@metamask/snaps-utils@5.0.1
[5.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@4.0.1...@metamask/snaps-utils@5.0.0
[4.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@4.0.0...@metamask/snaps-utils@4.0.1
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
