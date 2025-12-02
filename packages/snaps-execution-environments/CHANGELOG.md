# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [10.3.0]

### Uncategorized

- feat: Add `DateTimePicker` component ([#3698](https://github.com/MetaMask/snaps/pull/3698))
- chore: Bump @lavamoat/webpack from 1.5.3 to 1.5.4 ([#3751](https://github.com/MetaMask/snaps/pull/3751))
- chore: Bump lavamoat from 10.0.1 to 10.0.2 ([#3752](https://github.com/MetaMask/snaps/pull/3752))

## [10.2.3]

### Fixed

- Input change events in `onUserInput` now accepts `null` values ([#3722](https://github.com/MetaMask/snaps/pull/3722))

## [10.2.2]

### Changed

- Move JSON-RPC request inspection outside of the executor ([#3356](https://github.com/MetaMask/snaps/pull/3356))
  - This reduces the amount of messages being passed around when using the `snap.request` function.
- Bump MetaMask dependencies ([#3651](https://github.com/MetaMask/snaps/pull/3651), [#3638](https://github.com/MetaMask/snaps/pull/3638), [#3648](https://github.com/MetaMask/snaps/pull/3648), [#3630](https://github.com/MetaMask/snaps/pull/3630), [#3628](https://github.com/MetaMask/snaps/pull/3628), [#3629](https://github.com/MetaMask/snaps/pull/3629), [#3607](https://github.com/MetaMask/snaps/pull/3607), [#3623](https://github.com/MetaMask/snaps/pull/3623), [#3612](https://github.com/MetaMask/snaps/pull/3612), [#3659](https://github.com/MetaMask/snaps/pull/3659))

## [10.2.1]

### Changed

- Bump ses from `1.13.1` to `1.14.0` ([#3557](https://github.com/MetaMask/snaps/pull/3557))

### Fixed

- Ignore "Premature close" stream messages ([#3074](https://github.com/MetaMask/snaps/pull/3074))

## [10.2.0]

### Added

- Add support for `onActive` and `onInactive` lifecycle hooks ([#3542](https://github.com/MetaMask/snaps/pull/3542))

## [10.1.0]

### Added

- Add non-fungible assets support to `onAssetsLookup` and `onAssetsMarketData` ([#3527](https://github.com/MetaMask/snaps/pull/3527))

## [10.0.0]

### Added

- **BREAKING:** Market data is now fetched through `onAssetsMarketData` instead
  of `onAssetConversion` ([#3496](https://github.com/MetaMask/snaps/pull/3496))
  - Previously, `onAssetConversion` could return a `marketData` property, which
    contained market data for the asset being converted. This property
    has been removed, and `onAssetsMarketData` should be used instead.

## [9.1.0]

### Added

- Add support for the `onWebSocketEvent` handler ([#3450](https://github.com/MetaMask/snaps/pull/3450))
- Add support for the `onStart` handler ([#3455](https://github.com/MetaMask/snaps/pull/3455))

## [9.0.0]

### Changed

- **BREAKING:** Drop support for Node.js 18 and 21 ([#3447](https://github.com/MetaMask/snaps/pull/3447))
- Bump `ses` from `1.12.0` to `1.13.0` ([#3438](https://github.com/MetaMask/snaps/pull/3438))

## [8.2.0]

### Added

- Add support for `AccountSelector` component ([#3088](https://github.com/MetaMask/snaps/pull/3088))

## [8.1.0]

### Added

- Add support for `wallet_switchEthereumChain` ([#2634](https://github.com/MetaMask/snaps/pull/2634))
- Add support for SIP-31 `onClientRequest` handler ([#3394](https://github.com/MetaMask/snaps/pull/3394))

## [8.0.1]

### Fixed

- Fix deployment of execution environments ([#3386](https://github.com/MetaMask/snaps/pull/3386))

## [8.0.0]

### Changed

- **BREAKING:** Build Snaps execution environments with Webpack ([#3322](https://github.com/MetaMask/snaps/pull/3322))
  - The execution environments are now in `dist/webpack` instead of
    `dist/browserify`.
  - The `node-process` and `node-thread` environments can now be imported as
    `@metamask/snaps-execution-environments/node-process` and
    `@metamask/snaps-execution-environments/node-thread` respectively.
- Change request notification order ([#3381](https://github.com/MetaMask/snaps/pull/3381))
- Bump `@metamask/post-message-stream` from `9.0.0` to `10.0.0` ([#3322](https://github.com/MetaMask/snaps/pull/3322))
- Bump `@metamask/providers` from `22.0.1` to `22.1.0` ([#3363](https://github.com/MetaMask/snaps/pull/3363))

### Removed

- **BREAKING:** Remove web worker execution environment ([#3371](https://github.com/MetaMask/snaps/pull/3371))

## [7.2.2]

### Fixed

- Reduce unnecessary validation on responses ([#3350](https://github.com/MetaMask/snaps/pull/3350))
- Return early from executor if possible to avoid unnecessary checks ([#3349](https://github.com/MetaMask/snaps/pull/3349))
- Stop unnecessarily encoding messages in web view executor ([#3347](https://github.com/MetaMask/snaps/pull/3347))

## [7.2.1]

### Fixed

- Add missing `includeMarketData` param to `onAssetsConversion` handler ([#3323](https://github.com/MetaMask/snaps/pull/3323))

## [7.2.0]

### Added

- Add support for market data to `onAssetsConversion` handler ([#3299](https://github.com/MetaMask/snaps/pull/3299))
- Add support for `onAssetHistoricalPrice` handler ([#3282](https://github.com/MetaMask/snaps/pull/3282))

## [7.1.0]

### Added

- Add support for the `AddressInput` component ([#3129](https://github.com/MetaMask/snaps/pull/3129))
- Add support for the `AssetSelector` component ([#3166](https://github.com/MetaMask/snaps/pull/3166))

### Changed

- Bump `@metamask/snaps from `20.0.0`to`21.0.0` ([#3247](https://github.com/MetaMask/snaps/pull/3247))
- Bump `nanoid` from `3.1.31` to `3.3.10` ([#3228](https://github.com/MetaMask/snaps/pull/3228), [#3255](https://github.com/MetaMask/snaps/pull/3255))

## [7.0.0]

### Changed

- **BREAKING:** Use a WebView per Snap on mobile ([#3085](https://github.com/MetaMask/snaps/pull/3085))
  - The WebView bundle no longer supports proxy executor calls and functions as a single executor.
- **BREAKING:** Encode messages in `WebViewMessageStream` as byte arrays ([#3077](https://github.com/MetaMask/snaps/pull/3077))
  - A version of `snaps-controllers` that supports this encoding is required.
- Bump MetaMask dependencies ([#3091](https://github.com/MetaMask/snaps/pull/3091), [#3057](https://github.com/MetaMask/snaps/pull/3057), [#3050](https://github.com/MetaMask/snaps/pull/3050))

## [6.14.0]

### Added

- Add `onProtocolRequest` handler ([#2875](https://github.com/MetaMask/snaps/pull/2875))
- Add `URLSearchParams` as a default endowment ([#3047](https://github.com/MetaMask/snaps/pull/3047))

## [6.13.0]

### Added

- Add `Intl` as a default global ([#3035](https://github.com/MetaMask/snaps/pull/3035))
- Add support for `onAssetsLookup` and `onAssetsConversion` handlers ([#3028](https://github.com/MetaMask/snaps/pull/3028))

## [6.12.0]

### Changed

- Bump MetaMask dependencies ([#2946](https://github.com/MetaMask/snaps/pull/2946), [#3007](https://github.com/MetaMask/snaps/pull/3007), [#3003](https://github.com/MetaMask/snaps/pull/3003), [#2989](https://github.com/MetaMask/snaps/pull/2989))
- Unblock `eth_signTypedData` ([#2969](https://github.com/MetaMask/snaps/pull/2969))

### Fixed

- Skip unnecesary provider initialization ([#2967](https://github.com/MetaMask/snaps/pull/2967))

## [6.11.0]

### Added

- Allow Snap exports to have async initialization logic ([#2918](https://github.com/MetaMask/snaps/pull/2918))
- Add support for `onSettingsPage` export ([#2911](https://github.com/MetaMask/snaps/pull/2911))

## [6.10.0]

### Added

- Add `isSecureContext` global ([#2893](https://github.com/MetaMask/snaps/pull/2893))

### Fixed

- Remove unnecessary proxy for provider globals ([#2850](https://github.com/MetaMask/snaps/pull/2850))
- Make fetch responses an instance of `Response` ([#2889](https://github.com/MetaMask/snaps/pull/2889))

## [6.9.2]

### Changed

- Bump MetaMask dependencies ([#2853](https://github.com/MetaMask/snaps/pull/2853))

### Fixed

- Reduce unnecessary JSON validation ([#2844](https://github.com/MetaMask/snaps/pull/2844))

## [6.9.1]

### Removed

- Remove `eth_sign` ([#2772](https://github.com/MetaMask/snaps/pull/2772))
  - This method was removed from the MetaMask extension, so any references to it
    in Snaps can be removed.

## [6.9.0]

### Changed

- Convert `createWindow` parameters to options bag ([#2765](https://github.com/MetaMask/snaps/pull/2765))

## [6.8.0]

### Added

- Add support for `metamask:` schemed URLs ([#2719](https://github.com/MetaMask/snaps/pull/2719))

## [6.7.2]

### Fixed

- Fix missing execution environment bundles ([#2734](https://github.com/MetaMask/snaps/pull/2734))

## [6.7.1]

### Fixed

- Fix invalid types in type declaration in some cases ([#2714](https://github.com/MetaMask/snaps/pull/2714))

## [6.7.0]

### Changed

- Unblock `wallet_requestSnaps` ([#2661](https://github.com/MetaMask/snaps/pull/2661))

### Fixed

- Fix ESM version of the package ([#2682](https://github.com/MetaMask/snaps/pull/2682))
  - This fixes the ESM version of the package to be fully compliant with the ESM
    standard.
- Bump `@metamask/utils` from `^9.1.0` to `^9.2.1` ([#2680](https://github.com/MetaMask/snaps/pull/2680))
- Bump other MetaMask dependencies ([#2703](https://github.com/MetaMask/snaps/pull/2703))

## [6.6.2]

### Changed

- Bump `@metamask/json-rpc-engine` from `^9.0.0` to `^9.0.2` ([#2593](https://github.com/metamask/snaps/pull/2593))
- Bump `@metamask/snaps-utils` from `^7.8.0` to `^7.8.1` ([#2595](https://github.com/MetaMask/snaps/pull/2595))

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

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@10.3.0...HEAD
[10.3.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@10.2.3...@metamask/snaps-execution-environments@10.3.0
[10.2.3]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@10.2.2...@metamask/snaps-execution-environments@10.2.3
[10.2.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@10.2.1...@metamask/snaps-execution-environments@10.2.2
[10.2.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@10.2.0...@metamask/snaps-execution-environments@10.2.1
[10.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@10.1.0...@metamask/snaps-execution-environments@10.2.0
[10.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@10.0.0...@metamask/snaps-execution-environments@10.1.0
[10.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@9.1.0...@metamask/snaps-execution-environments@10.0.0
[9.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@9.0.0...@metamask/snaps-execution-environments@9.1.0
[9.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@8.2.0...@metamask/snaps-execution-environments@9.0.0
[8.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@8.1.0...@metamask/snaps-execution-environments@8.2.0
[8.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@8.0.1...@metamask/snaps-execution-environments@8.1.0
[8.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@8.0.0...@metamask/snaps-execution-environments@8.0.1
[8.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@7.2.2...@metamask/snaps-execution-environments@8.0.0
[7.2.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@7.2.1...@metamask/snaps-execution-environments@7.2.2
[7.2.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@7.2.0...@metamask/snaps-execution-environments@7.2.1
[7.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@7.1.0...@metamask/snaps-execution-environments@7.2.0
[7.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@7.0.0...@metamask/snaps-execution-environments@7.1.0
[7.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@6.14.0...@metamask/snaps-execution-environments@7.0.0
[6.14.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@6.13.0...@metamask/snaps-execution-environments@6.14.0
[6.13.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@6.12.0...@metamask/snaps-execution-environments@6.13.0
[6.12.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@6.11.0...@metamask/snaps-execution-environments@6.12.0
[6.11.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@6.10.0...@metamask/snaps-execution-environments@6.11.0
[6.10.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@6.9.2...@metamask/snaps-execution-environments@6.10.0
[6.9.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@6.9.1...@metamask/snaps-execution-environments@6.9.2
[6.9.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@6.9.0...@metamask/snaps-execution-environments@6.9.1
[6.9.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@6.8.0...@metamask/snaps-execution-environments@6.9.0
[6.8.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@6.7.2...@metamask/snaps-execution-environments@6.8.0
[6.7.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@6.7.1...@metamask/snaps-execution-environments@6.7.2
[6.7.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@6.7.0...@metamask/snaps-execution-environments@6.7.1
[6.7.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@6.6.2...@metamask/snaps-execution-environments@6.7.0
[6.6.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-execution-environments@6.6.1...@metamask/snaps-execution-environments@6.6.2
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
