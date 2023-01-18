# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.28.0]
### Added
- **BREAKING:** Add support for snap registries ([#1090](https://github.com/MetaMask/snaps-monorepo/pull/1090))
  - This removes the `checkBlockList` constructor argument in favor of `registry`
  - A registry implementation can be passed here, defaulting to a hosted JSON file
  - Requiring a snap to be on the allowlist can be toggled with the feature flag `requireAllowlist`
- Add experimental offscreen execution environment ([#1082](https://github.com/MetaMask/snaps-monorepo/pull/1082))

### Changed
- **BREAKING:** Bump `key-tree` to 6.2.0 and use `Uint8Array` for secret recovery phrases ([#1137](https://github.com/MetaMask/snaps-monorepo/pull/1137))

### Removed
- **BREAKING:** Remove `WebSocket` endowment ([#1122](https://github.com/MetaMask/snaps-monorepo/pull/1122))

### Fixed
- Fix missing cronjob export ([#1134](https://github.com/MetaMask/snaps-monorepo/pull/1134))

## [0.27.1]
### Changed
- No changes this release.

## [0.27.0]
### Changed
- **BREAKING:** Use SIP-6 algorithm for state encryption ([#1055](https://github.com/MetaMask/snaps-monorepo/pull/1055))
  - This breaks all existing snaps that use `snap_manageState`
- **BREAKING:** Use custom UI in transaction insights ([#1047](https://github.com/MetaMask/snaps-monorepo/pull/1047))
- **BREAKING:** Move all internal types from `snaps-types` to `snaps-utils` ([#1060](https://github.com/MetaMask/snaps-monorepo/pull/1060))

## [0.26.2]
### Changed
- No changes this release.

## [0.26.1]
### Fixed
- Fix some paths being wrongly normalized ([#1053](https://github.com/MetaMask/snaps-monorepo/pull/1053))
- Fix utils browser export ([#1049](https://github.com/MetaMask/snaps-monorepo/pull/1049))

## [0.26.0]
### Fixed
- Fix post processing issue with `object.eval` ([#1040](https://github.com/MetaMask/snaps-monorepo/pull/1040))

## [0.25.0]
### Added
- **BREAKING:** Add JSON-RPC handler permission ([#905](https://github.com/MetaMask/snaps-monorepo/pull/905))
  - Snaps are now required to request `endowment:rpc` to receive RPC requests.

## [0.24.1]
### Fixed
- Fix `snap_getBip32PublicKey` manifest validation ([#970](https://github.com/MetaMask/snaps-monorepo/pull/970))

## [0.24.0]
### Added
- Add transaction insight caveat for accessing transaction origin ([#902](https://github.com/MetaMask/snaps-monorepo/pull/902))
- Add `snap_getEntropy` JSON-RPC method ([#940](https://github.com/MetaMask/snaps-monorepo/pull/940))
- Add permission validation to `snap.manifest.json` ([#910](https://github.com/MetaMask/snaps-monorepo/pull/910))
- Add compile-time warning when using `Math.random` ([#950](https://github.com/MetaMask/snaps-monorepo/pull/950))

### Changed
- **BREAKING:** Rename package to start with `snaps-` ([#937](https://github.com/MetaMask/snaps-monorepo/pull/937))
- **BREAKING:** Remove `wallet` global in favor of `snap` and `ethereum` ([#939](https://github.com/MetaMask/snaps-monorepo/pull/939), [#964](https://github.com/MetaMask/snaps-monorepo/pull/964))

## [0.23.0]
### Added
- Add snap cronjobs ([#651](https://github.com/MetaMask/snaps-monorepo/pull/651))

### Changed
- **BREAKING:** Replace Buffer with Typed Arrays ([#878](https://github.com/MetaMask/snaps-monorepo/pull/878))
- Improve keyring endowment error messaging ([#884](https://github.com/MetaMask/snaps-monorepo/pull/884))
- Replace JSON schema validation with structs ([#862](https://github.com/MetaMask/snaps-monorepo/pull/862))

### Removed
- **BREAKING:** Stop including source code in SnapController state ([#861](https://github.com/MetaMask/snaps-monorepo/pull/861))

## [0.22.3]
### Fixed
- Make @babel/types a regular dependency ([#852](https://github.com/MetaMask/snaps-monorepo/pull/852))

## [0.22.2]
### Changed
- No changes this release.

## [0.22.1]
### Fixed
- Add browser entry point for `snap-utils` ([#820](https://github.com/MetaMask/snaps-monorepo/pull/820))

## [0.22.0]
### Added
- Add functionality required for Snap Keyring support ([#700](https://github.com/MetaMask/snaps-monorepo/pull/700), [#777](https://github.com/MetaMask/snaps-monorepo/pull/777))

## [0.21.0]
### Changed
- Run eval and fix manifest in bundler plugins ([#731](https://github.com/MetaMask/snaps-monorepo/pull/731))

## [0.20.0]
### Added
- **BREAKING:** Add Transaction Insight API ([#642](https://github.com/MetaMask/snaps-monorepo/pull/642))
- Add internal types from `@metamask/snaps-types` ([#695](https://github.com/MetaMask/snaps-monorepo/pull/695))

### Changed
- **BREAKING:** Simplify manifest format for permission caveats ([#705](https://github.com/MetaMask/snaps-monorepo/pull/705))
- Reduce TypeScript compilation target for `snap-controllers` ([#708](https://github.com/MetaMask/snaps-monorepo/pull/708))

## [0.19.1]
### Added
- Generate source maps from modified code ([#615](https://github.com/MetaMask/snaps-monorepo/pull/615))

## [0.19.0]
### Changed
- Move eval functionality to utils package ([#666](https://github.com/MetaMask/snaps-monorepo/pull/666))
- Move manifest handling functionality to utils ([#652](https://github.com/MetaMask/snaps-monorepo/pull/652))
- Move JSON schemas and controller utils to utils package ([#623](https://github.com/MetaMask/snaps-monorepo/pull/623))

### Fixed
- Fixed missing AbortSignal in default endowments ([#682](https://github.com/MetaMask/snaps-monorepo/pull/682))

## [0.18.1]
### Changed
- No changes this release.

## [0.18.0]
### Changed
- Reduce TypeScript compilation target to ES2017 ([#628](https://github.com/MetaMask/snaps-monorepo/pull/628))

## [0.17.0]
### Changed
- **BREAKING:** Bump minimum Node version to 16 ([#601](https://github.com/MetaMask/snaps-monorepo/pull/601))

## [0.16.0]
### Changed
- No changes this release.

## [0.15.0]
### Fixed
- Fix an issue where comment stripping would break for large files ([#468](https://github.com/MetaMask/snaps-monorepo/pull/468))

## [0.14.0]
### Changed
- **BREAKING:** Increase TypeScript compilation target to ES2020 ([#449](https://github.com/MetaMask/snaps-monorepo/pull/449))
  - This should not be breaking for consumers on any non-deprecated browser or Node.js version.

## [0.13.0]
### Changed
- No changes this release.

## [0.12.0]
### Added
- Initial release ([#410](https://github.com/MetaMask/snaps-monorepo/pull/410), [#421](https://github.com/MetaMask/snaps-monorepo/pull/421))

[Unreleased]: https://github.com/MetaMask/snaps-monorepo/compare/v0.28.0...HEAD
[0.28.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.27.1...v0.28.0
[0.27.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.27.0...v0.27.1
[0.27.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.26.2...v0.27.0
[0.26.2]: https://github.com/MetaMask/snaps-monorepo/compare/v0.26.1...v0.26.2
[0.26.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.26.0...v0.26.1
[0.26.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.25.0...v0.26.0
[0.25.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.24.1...v0.25.0
[0.24.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.24.0...v0.24.1
[0.24.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.23.0...v0.24.0
[0.23.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.22.3...v0.23.0
[0.22.3]: https://github.com/MetaMask/snaps-monorepo/compare/v0.22.2...v0.22.3
[0.22.2]: https://github.com/MetaMask/snaps-monorepo/compare/v0.22.1...v0.22.2
[0.22.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.22.0...v0.22.1
[0.22.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.21.0...v0.22.0
[0.21.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.20.0...v0.21.0
[0.20.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.19.1...v0.20.0
[0.19.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.19.0...v0.19.1
[0.19.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.18.1...v0.19.0
[0.18.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.18.0...v0.18.1
[0.18.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.17.0...v0.18.0
[0.17.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.16.0...v0.17.0
[0.16.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.15.0...v0.16.0
[0.15.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.14.0...v0.15.0
[0.14.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.13.0...v0.14.0
[0.13.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.12.0...v0.13.0
[0.12.0]: https://github.com/MetaMask/snaps-monorepo/releases/tag/v0.12.0
