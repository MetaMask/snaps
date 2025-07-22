# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Uncategorized

- feat: Add `onActive` and `onInactive` lifecycle hooks ([#3542](https://github.com/MetaMask/snaps/pull/3542))

## [11.1.0]

### Added

- Add support for non-fungible assets to `endowment:assets` ([#3527](https://github.com/MetaMask/snaps/pull/3527))

## [11.0.0]

### Added

- **BREAKING:** Market data is now fetched through `onAssetsMarketData` instead
  of `onAssetConversion` ([#3496](https://github.com/MetaMask/snaps/pull/3496))
  - Previously, `onAssetConversion` could return a `marketData` property, which
    contained market data for the asset being converted. This property
    has been removed, and `onAssetsMarketData` should be used instead.
  - The `MarketDataStruct` is now replaced by the `FungibleAssetMarketDataStruct` struct.
- Add `snap_trackError` method for error tracking through Sentry ([#3498](https://github.com/MetaMask/snaps/pull/3498))

## [10.1.0]

### Added

- Add support for the `onWebSocketEvent` handler ([#3450](https://github.com/MetaMask/snaps/pull/3450), [#3459](https://github.com/MetaMask/snaps/pull/3459))
- Add support for the `onStart` handler ([#3455](https://github.com/MetaMask/snaps/pull/3455))

### Fixed

- Fix unused permission detection for endowments with multiple handlers ([#3452](https://github.com/MetaMask/snaps/pull/3452))

## [10.0.0]

### Added

- Support scheduling cronjobs with an ISO 8601 duration ([#3421](https://github.com/MetaMask/snaps/pull/3421))

### Changed

- **BREAKING:** Drop support for Node.js 18 and 21 ([#3447](https://github.com/MetaMask/snaps/pull/3447))

### Fixed

- Unwrap double-wrapped JSON-RPC errors ([#3432](https://github.com/MetaMask/snaps/pull/3432))

## [9.4.0]

### Added

- Validate platform version against production ([#3417](https://github.com/MetaMask/snaps/pull/3417))
- Detect unused permissions in Snaps CLI ([#3335](https://github.com/MetaMask/snaps/pull/3335))
- Add support for `AccountSelector` component ([#3088](https://github.com/MetaMask/snaps/pull/3088))
- Add `toCensoredISO8601String` util function ([#3414](https://github.com/MetaMask/snaps/pull/3414))

### Changed

- Bump `@metamask/slip44` from `4.1.0` to `4.2.0` ([#3419](https://github.com/MetaMask/snaps/pull/3419))

## [9.3.0]

### Added

- Add support for SIP-31 `onClientRequest` handler ([#3394](https://github.com/MetaMask/snaps/pull/3394))

## [9.2.2]

### Changed

- Bump `@metamask/post-message-stream` from `9.0.0` to `10.0.0` ([#3322](https://github.com/MetaMask/snaps/pull/3322))
- Bump `@metamask/base-controller` from `8.0.0` to `8.0.1` ([#3365](https://github.com/MetaMask/snaps/pull/3365))

## [9.2.1]

### Fixed

- Reduce unnecessary validation on responses ([#3350](https://github.com/MetaMask/snaps/pull/3350))
- Speed up JSON size calculation ([#3348](https://github.com/MetaMask/snaps/pull/3348))

## [9.2.0]

### Added

- Add ISO 8601 time structs ([#3287](https://github.com/MetaMask/snaps/pull/3287))
- Add support for market data to `onAssetsConversion` handler ([#3299](https://github.com/MetaMask/snaps/pull/3299))
- Add support for `onAssetHistoricalPrice` handler ([#3282](https://github.com/MetaMask/snaps/pull/3282))

## [9.1.0]

### Added

- Add utilities for validating `AssetSelector` component ([#3166](https://github.com/MetaMask/snaps/pull/3166))

### Changed

- Bump `@metamask/key-tree` from `10.0.2` to `10.1.1` ([#3254](https://github.com/MetaMask/snaps/pull/3254), [#3217](https://github.com/MetaMask/snaps/pull/3217))

## [9.0.1]

### Fixed

- Improve error messaging ([#3142](https://github.com/MetaMask/snaps/pull/3142))

## [9.0.0]

### Changed

- **BREAKING:** Remove duplicate CAIP types ([#3071](https://github.com/MetaMask/snaps/pull/3071))
  - The following functions, values, types, and structs were removed from `@metamask/snaps-utils`:
    - `CHAIN_ID_REGEX`
    - `ACCOUNT_ID_REGEX`
    - `ACCOUNT_ADDRESS_REGEX`
    - `parseChainId`
    - `parseAccountId`
    - `LimitedString`
    - `ChainIdStringStruct`
    - `ChainIdStruct`
    - `AccountIdStruct`
    - `AccountIdArrayStruct`
    - `AccountAddressStruct`
    - `AccountAddress`
    - `ChainStruct`
    - `Chain`
    - `NamespaceStruct`
    - `Namespace`
    - `NamespaceIdStruct`
    - `NamespaceId`
    - `isNamespaceId`
    - `isChainId`
    - `isAccountId`
    - `isAccountIdArray`
    - `isNamespace`
- Bump MetaMask dependencies ([#3091](https://github.com/MetaMask/snaps/pull/3091), [#3082](https://github.com/MetaMask/snaps/pull/3082), [#3050](https://github.com/MetaMask/snaps/pull/3050))

## [8.10.0]

### Added

- Add support for `onProtocolRequest` handler ([#2875](https://github.com/MetaMask/snaps/pull/2875))
- Add `URLSearchParams` as a default global ([#3047](https://github.com/MetaMask/snaps/pull/3047))

## [8.9.1]

### Fixed

- Correct validation for scopes on `endowment:assets` permission ([#3039](https://github.com/MetaMask/snaps/pull/3039))

## [8.9.0]

### Added

- Add support for `onAssetsLookup` and `onAssetsConversion` handlers ([#3028](https://github.com/MetaMask/snaps/pull/3028))
- Add `Intl` as a default global ([#3035](https://github.com/MetaMask/snaps/pull/3035))

## [8.8.0]

### Added

- Add Massa derivation path ([#2979](https://github.com/MetaMask/snaps/pull/2979))

### Changed

- Bump MetaMask dependencies ([#2946](https://github.com/MetaMask/snaps/pull/2946), [#2999](https://github.com/MetaMask/snaps/pull/2999), [#3003](https://github.com/MetaMask/snaps/pull/3003), [#2996](https://github.com/MetaMask/snaps/pull/2996), [#2989](https://github.com/MetaMask/snaps/pull/2989))
- Make `jobs` property fully optional in the cronjob endowment ([#3005](https://github.com/MetaMask/snaps/pull/3005))

## [8.7.0]

### Added

- Add `onSettingsPage` export ([#2911](https://github.com/MetaMask/snaps/pull/2911))
- Automatically add `platformVersion` to manifest ([#2938](https://github.com/MetaMask/snaps/pull/2938))

## [8.6.1]

### Changed

- Bump `@metamask/key-tree` from `^9.1.2` to `^10.0.1` ([#2909](https://github.com/MetaMask/snaps/pull/2909))

## [8.6.0]

### Added

- Add `isSecureContext` global ([#2893](https://github.com/MetaMask/snaps/pull/2893))

## [8.5.2]

### Fixed

- Add line beginning to origin regex ([#2876](https://github.com/MetaMask/snaps/pull/2876))

## [8.5.1]

### Fixed

- Use regular import to reference package.json ([#2871](https://github.com/MetaMask/snaps/pull/2871))

## [8.5.0]

### Added

- Add platform version field to manifest ([#2803](https://github.com/MetaMask/snaps/pull/2803))
- Add Kadena derivation path ([#2851](https://github.com/MetaMask/snaps/pull/2851))

### Changed

- Bump MetaMask dependencies ([#2853](https://github.com/MetaMask/snaps/pull/2853))

## [8.4.1]

### Fixed

- Pass full URLs to `PhishingController` ([#2835](https://github.com/MetaMask/snaps/pull/2835))
- Make `parseMetaMaskUrl` platform-agnostic ([#2834](https://github.com/MetaMask/snaps/pull/2834))

## [8.4.0]

### Added

- Add `isSnapId` utility function ([#2808](https://github.com/MetaMask/snaps/pull/2808))

## [8.3.0]

### Added

- Add `currency` struct ([#2763](https://github.com/MetaMask/snaps/pull/2763))

### Changed

- Convert `createWindow` parameters to options bag ([#2765](https://github.com/MetaMask/snaps/pull/2765))

### Fixed

- Update `package.json` struct to allow `repository.directory` ([#2754](https://github.com/MetaMask/snaps/pull/2754))

## [8.2.0]

### Added

- Add support for `metamask:` schemed URLs ([#2719](https://github.com/MetaMask/snaps/pull/2719))
- Add support for JSX in `snap_notify` notifications ([#2706](https://github.com/MetaMask/snaps/pull/2706))

### Fixed

- Validate list of emails in `validateLink` function ([#2750](https://github.com/MetaMask/snaps/pull/2750))

## [8.1.1]

### Fixed

- Fix invalid types in type declaration in some cases ([#2714](https://github.com/MetaMask/snaps/pull/2714))

## [8.1.0]

### Added

- Add Bitcoin Taproot derivation paths ([#2695](https://github.com/MetaMask/snaps/pull/2695))

### Changed

- Improve `validateLink` error handling ([#2702](https://github.com/MetaMask/snaps/pull/2702))

### Fixed

- Fix ESM version of the package ([#2682](https://github.com/MetaMask/snaps/pull/2682))
  - This fixes the ESM version of the package to be fully compliant with the ESM
    standard.
- Bump `@metamask/utils` from `^9.1.0` to `^9.2.1` ([#2680](https://github.com/MetaMask/snaps/pull/2680))
- Bump other MetaMask dependencies ([#2703](https://github.com/MetaMask/snaps/pull/2703))

## [8.0.1]

### Changed

- Bump `@metamask/slip44` to 4.0.0 ([#2624](https://github.com/MetaMask/snaps/pull/2624))

## [8.0.0]

### Changed

- **BREAKING:** Improve manifest validation output ([#2605](https://github.com/MetaMask/snaps/pull/2605), [#2572](https://github.com/MetaMask/snaps/pull/2572))
  - This is breaking as it removes exports such as `validateNpmSnap`.
- Bump `fast-xml-parser` ([#2610](https://github.com/MetaMask/snaps/pull/2610))

## [7.8.1]

### Changed

- Bump `@metamask/base-controller` from `^6.0.1` to `^6.0.2` ([#2593](https://github.com/metamask/snaps/pull/2593))
- Bump `@metamask/permission-controller` from `^10.0.1` to `^11.0.0` ([#2593](https://github.com/metamask/snaps/pull/2593))

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

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@11.1.0...HEAD
[11.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@11.0.0...@metamask/snaps-utils@11.1.0
[11.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@10.1.0...@metamask/snaps-utils@11.0.0
[10.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@10.0.0...@metamask/snaps-utils@10.1.0
[10.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@9.4.0...@metamask/snaps-utils@10.0.0
[9.4.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@9.3.0...@metamask/snaps-utils@9.4.0
[9.3.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@9.2.2...@metamask/snaps-utils@9.3.0
[9.2.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@9.2.1...@metamask/snaps-utils@9.2.2
[9.2.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@9.2.0...@metamask/snaps-utils@9.2.1
[9.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@9.1.0...@metamask/snaps-utils@9.2.0
[9.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@9.0.1...@metamask/snaps-utils@9.1.0
[9.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@9.0.0...@metamask/snaps-utils@9.0.1
[9.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@8.10.0...@metamask/snaps-utils@9.0.0
[8.10.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@8.9.1...@metamask/snaps-utils@8.10.0
[8.9.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@8.9.0...@metamask/snaps-utils@8.9.1
[8.9.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@8.8.0...@metamask/snaps-utils@8.9.0
[8.8.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@8.7.0...@metamask/snaps-utils@8.8.0
[8.7.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@8.6.1...@metamask/snaps-utils@8.7.0
[8.6.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@8.6.0...@metamask/snaps-utils@8.6.1
[8.6.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@8.5.2...@metamask/snaps-utils@8.6.0
[8.5.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@8.5.1...@metamask/snaps-utils@8.5.2
[8.5.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@8.5.0...@metamask/snaps-utils@8.5.1
[8.5.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@8.4.1...@metamask/snaps-utils@8.5.0
[8.4.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@8.4.0...@metamask/snaps-utils@8.4.1
[8.4.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@8.3.0...@metamask/snaps-utils@8.4.0
[8.3.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@8.2.0...@metamask/snaps-utils@8.3.0
[8.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@8.1.1...@metamask/snaps-utils@8.2.0
[8.1.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@8.1.0...@metamask/snaps-utils@8.1.1
[8.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@8.0.1...@metamask/snaps-utils@8.1.0
[8.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@8.0.0...@metamask/snaps-utils@8.0.1
[8.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@7.8.1...@metamask/snaps-utils@8.0.0
[7.8.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-utils@7.8.0...@metamask/snaps-utils@7.8.1
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
