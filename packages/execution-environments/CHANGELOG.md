# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.16.0]
### Changed
- **BREAKING:** Snaps are now required to export `onRpcRequest` to receive RPC requests ([#481](https://github.com/MetaMask/snaps-skunkworks/pull/481), [#533](https://github.com/MetaMask/snaps-skunkworks/pull/533), [#538](https://github.com/MetaMask/snaps-skunkworks/pull/538), [#541](https://github.com/MetaMask/snaps-skunkworks/pull/541))
- Snaps can no longer run timers outside of pending RPC requests ([#490](https://github.com/MetaMask/snaps-skunkworks/pull/490))

### Removed
- **BREAKING:** Remove `wallet.registerRpcMessageHandler` support [#481](https://github.com/MetaMask/snaps-skunkworks/pull/481)

### Fixed
- Fix issue with iframe error reporting ([#501](https://github.com/MetaMask/snaps-skunkworks/pull/501))

## [0.15.0]
### Fixed
- Added missing properties to `WebAssembly` global ([#459](https://github.com/MetaMask/snaps-skunkworks/pull/459))
- Fix interval handle leak ([#485](https://github.com/MetaMask/snaps-skunkworks/pull/485))
- Fix timer handle leak ([#483](https://github.com/MetaMask/snaps-skunkworks/pull/483))

## [0.14.0]
### Changed
- **BREAKING:** Increase TypeScript compilation target to ES2020 ([#449](https://github.com/MetaMask/snaps-skunkworks/pull/449))
  - This should not be breaking for consumers on any non-deprecated browser or Node.js version.

## [0.13.0]
### Changed
- **BREAKING:** Change `execution-environment` build output ([#424](https://github.com/MetaMask/snaps-skunkworks/pull/424))

## [0.12.0]
### Added
- Add support for endowment teardown ([#407](https://github.com/MetaMask/snaps-skunkworks/pull/407))

## [0.11.1]
### Changed
- No changes this release.

## [0.11.0]
### Changed
- Bump `ses` to `0.15.15` ([#396](https://github.com/MetaMask/snaps-skunkworks/pull/396))
- Upgraded TypeScript version to minimum 4.4 ([#360](https://github.com/MetaMask/snaps-skunkworks/pull/360))
- Remove cross-fetch ([#349](https://github.com/MetaMask/snaps-skunkworks/pull/349))

## [0.10.7]
### Added
- Add setInterval and clearInterval as default endowments ([#326](https://github.com/MetaMask/snaps-skunkworks/pull/326))

### Changed
- **BREAKING:** Bump minimum Node version from 12 to 14 ([#331](https://github.com/MetaMask/snaps-skunkworks/pull/331))

### Fixed
- Fix missing properties on WebAssembly endowment ([#334](https://github.com/MetaMask/snaps-skunkworks/pull/334))

## [0.10.6]
### Fixed
- Fix function endowment bindings ([#311](https://github.com/MetaMask/snaps-skunkworks/pull/311))

## [0.10.5]
### Fixed
- Fix missing index.js ([#303](https://github.com/MetaMask/snaps-skunkworks/pull/303))

## [0.10.4]
### Fixed
- Fix endowed global functions with properties ([#294](https://github.com/MetaMask/snaps-skunkworks/pull/294))
  - Endowments like `Date` were missing all properties except `name` and `length`, causing e.g. `Date.now` to be `undefined`. This is no longer the case.

## [0.10.3]
### Changed
- No changes this release.

## [0.10.2]
### Fixed
- Remove faulty postinstall script ([#279](https://github.com/MetaMask/snaps-skunkworks/pull/279))
  - The faulty script caused the installation of this package to fail for consumers.

## [0.10.1]
### Fixed
- Removed deprecated package ([#272](https://github.com/MetaMask/snaps-skunkworks/pull/272))
  - This package now uses the functionally equivalent `@metamask/providers` instead of the deprecated `@metamask/inpage-provider`.

## [0.10.0]
### Changed
- Initial release, made using components from the deprecated [`@metamask/snap-workers`](https://npmjs.com/package/@metamask/snap-workers) package. ([#231](https://github.com/MetaMask/snaps-skunkworks/pull/231))
  - Breaking changes are relative to the old package.
- **BREAKING:** Endowments must be passed to the execution environment ([#252](https://github.com/MetaMask/snaps-skunkworks/pull/252)), ([#266](https://github.com/MetaMask/snaps-skunkworks/pull/266))
  - Previously, default endowments were specified in the execution environment itself. Now, all endowments must be specified in the `executeSnap` RPC parameters, except for the `wallet` API object.
- Add endowments to the global `self` in addition to `window` ([#263](https://github.com/MetaMask/snaps-skunkworks/pull/263))

[Unreleased]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.16.0...HEAD
[0.16.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.15.0...v0.16.0
[0.15.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.14.0...v0.15.0
[0.14.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.13.0...v0.14.0
[0.13.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.12.0...v0.13.0
[0.12.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.11.1...v0.12.0
[0.11.1]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.11.0...v0.11.1
[0.11.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.10.7...v0.11.0
[0.10.7]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.10.6...v0.10.7
[0.10.6]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.10.5...v0.10.6
[0.10.5]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.10.4...v0.10.5
[0.10.4]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.10.3...v0.10.4
[0.10.3]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.10.2...v0.10.3
[0.10.2]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.10.1...v0.10.2
[0.10.1]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.10.0...v0.10.1
[0.10.0]: https://github.com/MetaMask/snaps-skunkworks/releases/tag/v0.10.0
