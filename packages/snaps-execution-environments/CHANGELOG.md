# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [6.6.1]
### Changed
- Bump `@metamask/rpc-errors` from `^6.2.1` to `^6.3.1` ([#2445](https://github.com/MetaMask/snaps/pull/2445))
- Bump `@metamask/utils` from `^8.3.0` to `^9.1.0` ([#2445](https://github.com/MetaMask/snaps/pull/2445))

### Fixed
- Replace `superstruct` with ESM-compatible `@metamask/superstruct` `^3.1.0` ([#2445](https://github.com/MetaMask/snaps/pull/2445))
  - This fixes the issue of this package being unusable by any TypeScript project that uses `Node16` or `NodeNext` as its `moduleResolution` option.
- Set `@metamask/providers` from `^17.0.0` to `17.0.0` ([#2445](https://github.com/MetaMask/snaps/pull/2445))
  - `17.1.0` and `17.1.1` introduce regressions.

## [6.6.0]
### Changed
- Inline LavaMoat in WebView bundle ([#2528](https://github.com/MetaMask/snaps/pull/2528), [#2564](https://github.com/MetaMask/snaps/pull/2564))

## [6.5.0]
### Added
- Add `Checkbox` component ([#2501](https://github.com/MetaMask/snaps/pull/2501))
- Add `FileInput` component ([#2469](https://github.com/MetaMask/snaps/pull/2469), [#2504](https://github.com/MetaMask/snaps/pull/2504))

### Fixed
- Support parameters in `setTimeout` and `setInterval` ([#2513](https://github.com/MetaMask/snaps/pull/2513))

## [6.4.0]
### Changed
- Update `onNameLookup` response to include `domainName` ([#2484](https://github.com/MetaMask/snaps/pull/2484))
- Bump MetaMask dependencies ([#2460](https://github.com/MetaMask/snaps/pull/2460))

## [6.3.0]
### Added
- Add origin to lifecycle hooks ([#2441](https://github.com/MetaMask/snaps/pull/2441))
  - Lifecycle hooks can now use the `origin` parameter to determine the origin
    of the installation or update.

### Changed
- Bump `@metamask/providers` from `16.1.0` to `17.0.0` ([#2442](https://github.com/MetaMask/snaps/pull/2442))

## [6.2.0]
### Added
- Add `context` field to `snap_createInterface` ([#2413](https://github.com/MetaMask/snaps/pull/2413))

## [6.1.0]
### Changed
- Unblock `eth_sendRawTransaction` ([#2362](https://github.com/MetaMask/snaps/pull/2362))
- Bump `@metamask/providers` from `16.0.0` to `16.1.0` ([#2386](https://github.com/MetaMask/snaps/pull/2386))

### Fixed
- Make `onUserInput` export optional ([#2373](https://github.com/MetaMask/snaps/pull/2373))
  - Snaps will no longer crash when interacting with a user interface when the
    Snap does not export `onUserInput`.

## [6.0.2]
### Fixed
- Throw an error if starting Snap has no exports ([#2357](https://github.com/MetaMask/snaps/pull/2357))

## [6.0.1]
### Fixed
- Allow `null` in `FormSubmitEventStruct` form state ([#2333](https://github.com/MetaMask/snaps/pull/2333))

## [6.0.0]
### Removed
- **BREAKING:** Remove broken `ethereum` properties ([#2296](https://github.com/MetaMask/snaps/pull/2296))
  - Snaps can no longer access `on` and `removeListener` on `ethereum`.
  - This feature was already non-functional.

## [5.0.4]
### Changed
- Bump MetaMask dependencies ([#2270](https://github.com/MetaMask/snaps/pull/2270))

## [5.0.3]
### Changed
- Bump `@metamask/providers` to `^15.0.0` ([#2231](https://github.com/MetaMask/snaps/pull/2231))
- Bump `@metamask/json-rpc-engine` to `^7.3.3` ([#2247](https://github.com/MetaMask/snaps/pull/2247))

## [5.0.2]
### Changed
- Bump LavaMoat packages ([#2234](https://github.com/MetaMask/snaps/pull/2234))

## [5.0.1]
### Fixed
- Fix minor build configuration problems ([#2220](https://github.com/MetaMask/snaps/pull/2220))

## [5.0.0]
### Changed
- **BREAKING:** Update ESM build to be fully compliant with the ESM standard ([#2210](https://github.com/MetaMask/snaps/pull/2210))
- Bump `@metamask/rpc-errors` to `^6.2.1` ([#2209](https://github.com/MetaMask/snaps/pull/2209))

### Fixed
- Enforce JSON-RPC response size limits ([#2201](https://github.com/MetaMask/snaps/pull/2201))

## [4.0.1]
### Changed
- Update several LavaMoat packages ([#2173](https://github.com/MetaMask/snaps/pull/2173))

## [4.0.0]
### Added
- Add WebView execution environment ([#2005](https://github.com/MetaMask/snaps/pull/2005))
- Add support for dynamic user interfaces ([#1465](https://github.com/MetaMask/snaps/pull/1465))

### Changed
- **BREAKING:** Stop bundling offscreen execution environment ([#2154](https://github.com/MetaMask/snaps/pull/2154))
- **BREAKING:** Deploy multiple bundles to AWS ([#2150](https://github.com/MetaMask/snaps/pull/2150))
  - From now on the bundles will be served at `https://execution.metamask.io/%BUILD_TYPE%/%VERSION%/index.html`.
- Export `ProxySnapExecutor` ([#2153](https://github.com/MetaMask/snaps/pull/2153))
- Reduce executor bundle sizes ([#2160](https://github.com/MetaMask/snaps/pull/2160))
- Bump MetaMask dependencies ([#2129](https://github.com/MetaMask/snaps/pull/2129), [#2132](https://github.com/MetaMask/snaps/pull/2132))

## [3.5.0]
### Added
- Add support for signature insights ([#2074](https://github.com/MetaMask/snaps/pull/2074))

### Changed
- Bump SES and LavaMoat ([#2105](https://github.com/MetaMask/snaps/pull/2105))
- Bump several MetaMask dependencies ([#2054](https://github.com/MetaMask/snaps/pull/2054), [#2100](https://github.com/MetaMask/snaps/pull/2100))

## [3.4.3]
### Changed
- Move iframe bundle to HTML body ([#2045](https://github.com/MetaMask/snaps/pull/2045))
- Bump `@metamask/json-rpc-engine` from `7.3.0` to `7.3.1` ([#2065](https://github.com/MetaMask/snaps/pull/2065))

## [3.4.2]
### Changed
- Bump `@metamask/providers` from `14.0.1` to `14.0.2` ([#1992](https://github.com/MetaMask/snaps/pull/1992))

## [3.4.1]
### Changed
- Block `wallet_revokePermissions` ([#1978](https://github.com/MetaMask/snaps/pull/1978))
- Bump several MetaMask dependencies ([#1964](https://github.com/MetaMask/snaps/pull/1964))

### Fixed
- Fix a few issues with passing non-JSON-serializable values ([#1974](https://github.com/MetaMask/snaps/pull/1974))

## [3.4.0]
### Changed
- Pause request timer when `fetch` is called ([#1756](https://github.com/MetaMask/snaps/pull/1756))

## [3.3.0]
### Changed
- Use `@metamask/snaps-sdk` package ([#1930](https://github.com/MetaMask/snaps/pull/1930),
  [#1946](https://github.com/MetaMask/snaps/pull/1946), [#1949](https://github.com/MetaMask/snaps/pull/1949),
  [#1954](https://github.com/MetaMask/snaps/pull/1954))
  - This package replaces the `@metamask/snaps-types` and
  - `@metamask/snaps-ui` packages.

## [3.2.0]
### Added
- Add `OnHomePage` export ([#1896](https://github.com/MetaMask/snaps/pull/1896))

### Fixed
- Await stream message delivery ([#1928](https://github.com/MetaMask/snaps/pull/1928))

## [3.1.0]
### Changed
- Improve error handling ([#1841](https://github.com/MetaMask/snaps/pull/1841))
  - Snaps can now throw a `SnapError`, without causing the Snap to crash.
- Standardise all errors thrown in execution environments ([#1830](https://github.com/MetaMask/snaps/pull/1830))

## [3.0.0]
### Added
- Add keyring export and endowment ([#1787](https://github.com/MetaMask/snaps/pull/1787))

### Changed
- **BREAKING:** Bump minimum Node.js version to `^18.16.0` ([#1741](https://github.com/MetaMask/snaps/pull/1741))

## [2.0.1]
### Changed
- Remove unmaintained OpenRPC doc for execution environment ([#1782](https://github.com/MetaMask/snaps/pull/1782))
- Update LavaMoat ([#1754](https://github.com/MetaMask/snaps/pull/1754))

### Fixed
- Allow passing `undefined` parameters to `request()` ([#1776](https://github.com/MetaMask/snaps/pull/1776))
- Fix an issue where errors would not correctly be returned ([#1772](https://github.com/MetaMask/snaps/pull/1772))

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

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@6.6.1...HEAD
[6.6.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@6.6.0...@metamask/snaps-execution-environments@6.6.1
[6.6.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@6.5.0...@metamask/snaps-execution-environments@6.6.0
[6.5.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@6.4.0...@metamask/snaps-execution-environments@6.5.0
[6.4.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@6.3.0...@metamask/snaps-execution-environments@6.4.0
[6.3.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@6.2.0...@metamask/snaps-execution-environments@6.3.0
[6.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@6.1.0...@metamask/snaps-execution-environments@6.2.0
[6.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@6.0.2...@metamask/snaps-execution-environments@6.1.0
[6.0.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@6.0.1...@metamask/snaps-execution-environments@6.0.2
[6.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@6.0.0...@metamask/snaps-execution-environments@6.0.1
[6.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@5.0.4...@metamask/snaps-execution-environments@6.0.0
[5.0.4]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@5.0.3...@metamask/snaps-execution-environments@5.0.4
[5.0.3]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@5.0.2...@metamask/snaps-execution-environments@5.0.3
[5.0.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@5.0.1...@metamask/snaps-execution-environments@5.0.2
[5.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@5.0.0...@metamask/snaps-execution-environments@5.0.1
[5.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@4.0.1...@metamask/snaps-execution-environments@5.0.0
[4.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@4.0.0...@metamask/snaps-execution-environments@4.0.1
[4.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@3.5.0...@metamask/snaps-execution-environments@4.0.0
[3.5.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@3.4.3...@metamask/snaps-execution-environments@3.5.0
[3.4.3]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@3.4.2...@metamask/snaps-execution-environments@3.4.3
[3.4.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@3.4.1...@metamask/snaps-execution-environments@3.4.2
[3.4.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@3.4.0...@metamask/snaps-execution-environments@3.4.1
[3.4.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@3.3.0...@metamask/snaps-execution-environments@3.4.0
[3.3.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@3.2.0...@metamask/snaps-execution-environments@3.3.0
[3.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@3.1.0...@metamask/snaps-execution-environments@3.2.0
[3.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@3.0.0...@metamask/snaps-execution-environments@3.1.0
[3.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@2.0.1...@metamask/snaps-execution-environments@3.0.0
[2.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@2.0.0...@metamask/snaps-execution-environments@2.0.1
[2.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@0.39.0-flask.1...@metamask/snaps-execution-environments@2.0.0
[0.39.0-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@0.38.3-flask.1...@metamask/snaps-execution-environments@0.39.0-flask.1
[0.38.3-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@0.38.2-flask.1...@metamask/snaps-execution-environments@0.38.3-flask.1
[0.38.2-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@0.38.1-flask.1...@metamask/snaps-execution-environments@0.38.2-flask.1
[0.38.1-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@0.38.0-flask.1...@metamask/snaps-execution-environments@0.38.1-flask.1
[0.38.0-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@0.37.3-flask.1...@metamask/snaps-execution-environments@0.38.0-flask.1
[0.37.3-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@0.37.2-flask.1...@metamask/snaps-execution-environments@0.37.3-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps/releases/tag/@metamask/snaps-execution-environments@0.37.2-flask.1
