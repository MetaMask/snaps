# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.28.0]
### Added
- Add experimental offscreen execution environment ([#1082](https://github.com/MetaMask/snaps-monorepo/pull/1082))

### Changed
- Add proxy for `ethereum` global ([#1087](https://github.com/MetaMask/snaps-monorepo/pull/1087))

### Removed
- **BREAKING:** Remove `WebSocket` endowment ([#1122](https://github.com/MetaMask/snaps-monorepo/pull/1122))

## [0.27.1]
### Changed
- No changes this release.

## [0.27.0]
### Changed
- **BREAKING:** Move all internal types from `snaps-types` to `snaps-utils` ([#1060](https://github.com/MetaMask/snaps-monorepo/pull/1060))

## [0.26.2]
### Fixed
- Fix usage of wrong `ethereum` global for `ethereum` endowment ([#1064](https://github.com/MetaMask/snaps-monorepo/pull/1064))

## [0.26.1]
### Changed
- No changes this release.

## [0.26.0]
### Changed
- No changes this release.

## [0.25.0]
### Changed
- No changes this release.

## [0.24.1]
### Changed
- No changes this release.

## [0.24.0]
### Added
- Add transaction insight caveat for accessing transaction origin ([#902](https://github.com/MetaMask/snaps-monorepo/pull/902))
- Add permission validation to `snap.manifest.json` ([#910](https://github.com/MetaMask/snaps-monorepo/pull/910))
- Add `Math` endowment factory ([#888](https://github.com/MetaMask/snaps-monorepo/pull/888))

### Changed
- **BREAKING:** Rename package to start with `snaps-` ([#937](https://github.com/MetaMask/snaps-monorepo/pull/937))
- **BREAKING:** Remove `wallet` global in favor of `snap` and `ethereum` ([#939](https://github.com/MetaMask/snaps-monorepo/pull/939), [#964](https://github.com/MetaMask/snaps-monorepo/pull/964))

## [0.23.0]
### Added
- Add snap cronjobs ([#651](https://github.com/MetaMask/snaps-monorepo/pull/651))

### Changed
- **BREAKING:** Replace Buffer with Typed Arrays ([#878](https://github.com/MetaMask/snaps-monorepo/pull/878))
- Improve execution environment type validation ([#844](https://github.com/MetaMask/snaps-monorepo/pull/844))

## [0.22.3]
### Fixed
- Fix missing properties on WebSocket MessageEvent ([#845](https://github.com/MetaMask/snaps-monorepo/pull/845))

## [0.22.2]
### Fixed
- Throw an error when response is unserializable ([#840](https://github.com/MetaMask/snaps-monorepo/pull/840))

## [0.22.1]
### Changed
- No changes this release.

## [0.22.0]
### Added
- Add Snap Keyring support ([#728](https://github.com/MetaMask/snaps-monorepo/pull/728), [#700](https://github.com/MetaMask/snaps-monorepo/pull/700))

## [0.21.0]
### Removed
- **BREAKING:** Remove origin parameter from transaction insight payload ([#730](https://github.com/MetaMask/snaps-monorepo/pull/730))

## [0.20.0]
### Added
- **BREAKING:** Add Transaction Insight API ([#642](https://github.com/MetaMask/snaps-monorepo/pull/642))
  - Part of this change made changes to the execution environments to support multiple request handlers
  - It also changed the exports of `@metamask/snaps-execution-environments`

## [0.19.1]
### Changed
- No changes this release.

## [0.19.0]
### Fixed
- Fixed network teardown so that snaps can't be escape by late returning promises ([#661](https://github.com/MetaMask/snaps-monorepo/pull/661))

## [0.18.1]
### Fixed
- Fix error serialization issues ([#637](https://github.com/MetaMask/snaps-monorepo/pull/637))

## [0.18.0]
### Changed
- Reduce TypeScript compilation target to ES2017 ([#628](https://github.com/MetaMask/snaps-monorepo/pull/628))

### Fixed
- Fix `crypto` and `SubtleCrypto` endowments ([#631](https://github.com/MetaMask/snaps-monorepo/pull/631))

## [0.17.0]
### Added
- Add Node.js `child_process` execution environment ([#523](https://github.com/MetaMask/snaps-monorepo/pull/523))
- Add Node.js `worker_threads` execution environment ([#587](https://github.com/MetaMask/snaps-monorepo/pull/587))
- Added network endowment teardown ([#514](https://github.com/MetaMask/snaps-monorepo/pull/514))

### Changed
- **BREAKING:** Bump minimum Node version to 16 ([#601](https://github.com/MetaMask/snaps-monorepo/pull/601))
- Monitor outbound snap requests to pause request timeout ([#593](https://github.com/MetaMask/snaps-monorepo/pull/593))

### Removed
- Remove WebWorker implementation ([#591](https://github.com/MetaMask/snaps-monorepo/pull/591))

## [0.16.0]
### Changed
- **BREAKING:** Snaps are now required to export `onRpcRequest` to receive RPC requests ([#481](https://github.com/MetaMask/snaps-monorepo/pull/481), [#533](https://github.com/MetaMask/snaps-monorepo/pull/533), [#538](https://github.com/MetaMask/snaps-monorepo/pull/538), [#541](https://github.com/MetaMask/snaps-monorepo/pull/541))
- Snaps can no longer run timers outside of pending RPC requests ([#490](https://github.com/MetaMask/snaps-monorepo/pull/490))

### Removed
- **BREAKING:** Remove `wallet.registerRpcMessageHandler` support [#481](https://github.com/MetaMask/snaps-monorepo/pull/481)

### Fixed
- Fix issue with iframe error reporting ([#501](https://github.com/MetaMask/snaps-monorepo/pull/501))

## [0.15.0]
### Fixed
- Added missing properties to `WebAssembly` global ([#459](https://github.com/MetaMask/snaps-monorepo/pull/459))
- Fix interval handle leak ([#485](https://github.com/MetaMask/snaps-monorepo/pull/485))
- Fix timer handle leak ([#483](https://github.com/MetaMask/snaps-monorepo/pull/483))

## [0.14.0]
### Changed
- **BREAKING:** Increase TypeScript compilation target to ES2020 ([#449](https://github.com/MetaMask/snaps-monorepo/pull/449))
  - This should not be breaking for consumers on any non-deprecated browser or Node.js version.

## [0.13.0]
### Changed
- **BREAKING:** Change `execution-environment` build output ([#424](https://github.com/MetaMask/snaps-monorepo/pull/424))

## [0.12.0]
### Added
- Add support for endowment teardown ([#407](https://github.com/MetaMask/snaps-monorepo/pull/407))

## [0.11.1]
### Changed
- No changes this release.

## [0.11.0]
### Changed
- Bump `ses` to `0.15.15` ([#396](https://github.com/MetaMask/snaps-monorepo/pull/396))
- Upgraded TypeScript version to minimum 4.4 ([#360](https://github.com/MetaMask/snaps-monorepo/pull/360))
- Remove cross-fetch ([#349](https://github.com/MetaMask/snaps-monorepo/pull/349))

## [0.10.7]
### Added
- Add setInterval and clearInterval as default endowments ([#326](https://github.com/MetaMask/snaps-monorepo/pull/326))

### Changed
- **BREAKING:** Bump minimum Node version from 12 to 14 ([#331](https://github.com/MetaMask/snaps-monorepo/pull/331))

### Fixed
- Fix missing properties on WebAssembly endowment ([#334](https://github.com/MetaMask/snaps-monorepo/pull/334))

## [0.10.6]
### Fixed
- Fix function endowment bindings ([#311](https://github.com/MetaMask/snaps-monorepo/pull/311))

## [0.10.5]
### Fixed
- Fix missing index.js ([#303](https://github.com/MetaMask/snaps-monorepo/pull/303))

## [0.10.4]
### Fixed
- Fix endowed global functions with properties ([#294](https://github.com/MetaMask/snaps-monorepo/pull/294))
  - Endowments like `Date` were missing all properties except `name` and `length`, causing e.g. `Date.now` to be `undefined`. This is no longer the case.

## [0.10.3]
### Changed
- No changes this release.

## [0.10.2]
### Fixed
- Remove faulty postinstall script ([#279](https://github.com/MetaMask/snaps-monorepo/pull/279))
  - The faulty script caused the installation of this package to fail for consumers.

## [0.10.1]
### Fixed
- Removed deprecated package ([#272](https://github.com/MetaMask/snaps-monorepo/pull/272))
  - This package now uses the functionally equivalent `@metamask/providers` instead of the deprecated `@metamask/inpage-provider`.

## [0.10.0]
### Changed
- Initial release, made using components from the deprecated [`@metamask/snap-workers`](https://npmjs.com/package/@metamask/snap-workers) package. ([#231](https://github.com/MetaMask/snaps-monorepo/pull/231))
  - Breaking changes are relative to the old package.
- **BREAKING:** Endowments must be passed to the execution environment ([#252](https://github.com/MetaMask/snaps-monorepo/pull/252)), ([#266](https://github.com/MetaMask/snaps-monorepo/pull/266))
  - Previously, default endowments were specified in the execution environment itself. Now, all endowments must be specified in the `executeSnap` RPC parameters, except for the `wallet` API object.
- Add endowments to the global `self` in addition to `window` ([#263](https://github.com/MetaMask/snaps-monorepo/pull/263))

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
[0.12.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.11.1...v0.12.0
[0.11.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.11.0...v0.11.1
[0.11.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.10.7...v0.11.0
[0.10.7]: https://github.com/MetaMask/snaps-monorepo/compare/v0.10.6...v0.10.7
[0.10.6]: https://github.com/MetaMask/snaps-monorepo/compare/v0.10.5...v0.10.6
[0.10.5]: https://github.com/MetaMask/snaps-monorepo/compare/v0.10.4...v0.10.5
[0.10.4]: https://github.com/MetaMask/snaps-monorepo/compare/v0.10.3...v0.10.4
[0.10.3]: https://github.com/MetaMask/snaps-monorepo/compare/v0.10.2...v0.10.3
[0.10.2]: https://github.com/MetaMask/snaps-monorepo/compare/v0.10.1...v0.10.2
[0.10.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.10.0...v0.10.1
[0.10.0]: https://github.com/MetaMask/snaps-monorepo/releases/tag/v0.10.0
