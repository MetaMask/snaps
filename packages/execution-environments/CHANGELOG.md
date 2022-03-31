# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.10.7]

### Added
- Add setInterval and clearInterval as default endowments ([#326](https://github.com/MetaMask/snaps-skunkworks/pull/326))

### Changed
- Bump minimum Node version from 12 to 14 ([#331](https://github.com/MetaMask/snaps-skunkworks/pull/331))

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

[Unreleased]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.10.7...HEAD
[0.10.7]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.10.6...v0.10.7
[0.10.6]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.10.5...v0.10.6
[0.10.5]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.10.4...v0.10.5
[0.10.4]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.10.3...v0.10.4
[0.10.3]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.10.2...v0.10.3
[0.10.2]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.10.1...v0.10.2
[0.10.1]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.10.0...v0.10.1
[0.10.0]: https://github.com/MetaMask/snaps-skunkworks/releases/tag/v0.10.0
