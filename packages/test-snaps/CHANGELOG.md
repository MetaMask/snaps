# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [5.5.0]
### Added
- Create networkAccess snap ([#168](https://github.com/MetaMask/test-snaps/pull/168))

## [5.4.0]
### Added
- Create a static test-data.json file for network access test ([#171](https://github.com/MetaMask/test-snaps/pull/171))
- Create test snap for ethereum-provider endowment ([#169](https://github.com/MetaMask/test-snaps/pull/169))

## [5.3.0]
### Added
- Create getEntropy test snap ([#162](https://github.com/MetaMask/test-snaps/pull/162))

## [5.2.0]
### Added
- Add WASM test snap ([#158](https://github.com/MetaMask/test-snaps/pull/158))

## [5.1.2]
### Changed
- Change version of update snap from `5.0.0 -> 5.0.1` to `5.1.1 -> 5.1.2` ([#156](https://github.com/MetaMask/test-snaps/pull/156))

## [5.1.1]
### Changed
- No changes this release.

## [5.1.0]
### Changed
- No changes this release.

## [5.0.3]
### Changed
- No changes this release.

## [5.0.2]
### Changed
- No changes this release.

## [5.0.1]
### Fixed
- Bump versions used in the update test ([#142](https://github.com/MetaMask/test-snaps/pull/142))
  - Previous versions pointed to broken versions of the test snap

## [5.0.0]
### Removed
- **BREAKING:** Remove all usage of `snap_confirm` ([#122](https://github.com/MetaMask/test-snaps/pull/122))

## [4.6.4]
### Fixed
- Fix dialog snap & site code ([#138](https://github.com/MetaMask/test-snaps/pull/138))

## [4.6.3]
### Changed
- No changes this release.

## [4.6.2]
### Changed
- fixed package.json ([#132](https://github.com/MetaMask/test-snaps/pull/132))

## [4.6.1]
### Changed
- No changes this release.

## [4.6.0]
### Added
- Create test-snap for cronjob ([#125](https://github.com/MetaMask/test-snaps/pull/125))

## [4.5.0]
### Added
- Create test-snap for snap_dialog ([#119](https://github.com/MetaMask/test-snaps/pull/119))

## [4.4.1]
### Changed
- Re-release to fix versioning problem

## [4.4.0]
### Changed
- No changes this release.

## [4.3.0]
### Added
- Add tx-insights test panel ([#110](https://github.com/MetaMask/test-snaps/pull/110))

## [4.2.0]
### Added
- Add JSON-RPC endowment test snap ([#105](https://github.com/MetaMask/test-snaps/pull/105))

## [4.1.2]
### Changed
- Show alert on errors ([#99](https://github.com/MetaMask/test-snaps/pull/99))

## [4.1.1]
### Fixed
- Remove undefined params in `snap_invokeSnap` ([#100](https://github.com/MetaMask/test-snaps/pull/100))

## [4.1.0]
### Changed
- Handle breaking changes with new version of Snaps Platform ([#95](https://github.com/MetaMask/test-snaps/pull/95))
- Use BIP32 snap for update snap test ([#94](https://github.com/MetaMask/test-snaps/pull/94))

## [4.0.2]
### Changed
- No changes this release.

## [4.0.1]
### Changed
- Fixed snap names ([#88](https://github.com/MetaMask/test-snaps/pull/88))

## [4.0.0]
### Changed
- **BREAKING**: Refactor site to use React ([#79](https://github.com/MetaMask/test-snaps/pull/79))

## [3.2.0]
### Changed
- No changes this release.

## [3.1.0]
### Added
- Add installed snaps card ([#77](https://github.com/MetaMask/test-snaps/pull/77))

### Changed
- Rework BIP32 test snap to add message signing ([#73](https://github.com/MetaMask/test-snaps/pull/73))

## [3.0.2]
### Changed
- No changes this release.

## [3.0.1]
### Fixed
- Fix `clean` npm script ([#67](https://github.com/MetaMask/test-snaps/pull/67))
- Fix `publish:all` npm script ([#68](https://github.com/MetaMask/test-snaps/pull/68))

## [3.0.0]
### Added
- Added tests for updating snaps ([#62](https://github.com/MetaMask/test-snaps/pull/62))
- Add BIP-32 test snap ([#56](https://github.com/MetaMask/test-snaps/pull/56), [#57](https://github.com/MetaMask/test-snaps/pull/57), [#64](https://github.com/MetaMask/test-snaps/pull/64))

### Changed
- **BREAKING**: Upgrade test-snaps to use Node v16 ([#53](https://github.com/MetaMask/test-snaps/pull/53))
- **BREAKING:** Update BIP-44 test snap to use `snap_getBip44Entropy` ([#57](https://github.com/MetaMask/test-snaps/pull/57))

## [2.0.0]
### Changed
- **BREAKING:** Redesign website ([#40](https://github.com/MetaMask/test-snaps/pull/40))
  - The website now uses a 2-column format with some prettifying CSS. Class and ID values have changed, which is breaking for E2E tests that use this website.

## [1.0.0]
### Changed
- No changes this release.

## [0.4.0]
### Added
- Add notifications snap ([#41](https://github.com/MetaMask/test-snaps/pull/41))

## [0.3.0]
### Changed
- Request specific versions for snaps in production ([#37](https://github.com/MetaMask/test-snaps/pull/37))
  - When the site is deployed to GitHub pages at a path ending in its SemVer version, connecting to a snap will request the version corresponding to the URL.
  - For example, if the URL is `metamask.github.io/test-snaps/0.3.0`, version `0.3.0` will be requested.
  - This change will be backported to previous GitHub pages releases of this package.

## [0.2.0]
### Changed
- No changes this release.

## [0.1.3]
### Changed
- No changes this release.

## [0.1.2]
### Changed
- No changes this release.

## [0.1.1]
### Fixed
- package.json homepage

## [0.1.0]
### Added
- BIP44 snap for testing ([#20](https://github.com/MetaMask/test-snaps/pull/20))
- website build script ([#22](https://github.com/MetaMask/test-snaps/pull/22))

### Fixed
- Fix various monorepo-related issues ([#18](https://github.com/MetaMask/test-snaps/pull/18))

## [0.0.9]
### Changed
- No changes this release.

## [0.0.8]
### Changed
- No changes this release.

## [0.0.7]
### Added
- ascii fox

## [0.0.4]
### Uncategorized
- Fixed linting

## [0.0.3]
### Uncategorized
- Fixed build in sites package.json

## [0.0.1]
### Uncategorized
- Fixed CHANGELOGs
- Added dummy CHANGELOG.md to site package
- Added dummy package.json for site package
- Added title
- Changed index to take snapIds as inputs
- Changed confirm snap to be configurable via params
- Updated index.html
- Added Error to index.html
- Added proper serve command

[Unreleased]: https://github.com/MetaMask/test-snaps/compare/v5.5.0...HEAD
[5.5.0]: https://github.com/MetaMask/test-snaps/compare/v5.4.0...v5.5.0
[5.4.0]: https://github.com/MetaMask/test-snaps/compare/v5.3.0...v5.4.0
[5.3.0]: https://github.com/MetaMask/test-snaps/compare/v5.2.0...v5.3.0
[5.2.0]: https://github.com/MetaMask/test-snaps/compare/v5.1.2...v5.2.0
[5.1.2]: https://github.com/MetaMask/test-snaps/compare/v5.1.1...v5.1.2
[5.1.1]: https://github.com/MetaMask/test-snaps/compare/v5.1.0...v5.1.1
[5.1.0]: https://github.com/MetaMask/test-snaps/compare/v5.0.3...v5.1.0
[5.0.3]: https://github.com/MetaMask/test-snaps/compare/v5.0.2...v5.0.3
[5.0.2]: https://github.com/MetaMask/test-snaps/compare/v5.0.1...v5.0.2
[5.0.1]: https://github.com/MetaMask/test-snaps/compare/v5.0.0...v5.0.1
[5.0.0]: https://github.com/MetaMask/test-snaps/compare/v4.6.4...v5.0.0
[4.6.4]: https://github.com/MetaMask/test-snaps/compare/v4.6.3...v4.6.4
[4.6.3]: https://github.com/MetaMask/test-snaps/compare/v4.6.2...v4.6.3
[4.6.2]: https://github.com/MetaMask/test-snaps/compare/v4.6.1...v4.6.2
[4.6.1]: https://github.com/MetaMask/test-snaps/compare/v4.6.0...v4.6.1
[4.6.0]: https://github.com/MetaMask/test-snaps/compare/v4.5.0...v4.6.0
[4.5.0]: https://github.com/MetaMask/test-snaps/compare/v4.4.1...v4.5.0
[4.4.1]: https://github.com/MetaMask/test-snaps/compare/v4.4.0...v4.4.1
[4.4.0]: https://github.com/MetaMask/test-snaps/compare/v4.3.0...v4.4.0
[4.3.0]: https://github.com/MetaMask/test-snaps/compare/v4.2.0...v4.3.0
[4.2.0]: https://github.com/MetaMask/test-snaps/compare/v4.1.2...v4.2.0
[4.1.2]: https://github.com/MetaMask/test-snaps/compare/v4.1.1...v4.1.2
[4.1.1]: https://github.com/MetaMask/test-snaps/compare/v4.1.0...v4.1.1
[4.1.0]: https://github.com/MetaMask/test-snaps/compare/v4.0.2...v4.1.0
[4.0.2]: https://github.com/MetaMask/test-snaps/compare/v4.0.1...v4.0.2
[4.0.1]: https://github.com/MetaMask/test-snaps/compare/v4.0.0...v4.0.1
[4.0.0]: https://github.com/MetaMask/test-snaps/compare/v3.2.0...v4.0.0
[3.2.0]: https://github.com/MetaMask/test-snaps/compare/v3.1.0...v3.2.0
[3.1.0]: https://github.com/MetaMask/test-snaps/compare/v3.0.2...v3.1.0
[3.0.2]: https://github.com/MetaMask/test-snaps/compare/v3.0.1...v3.0.2
[3.0.1]: https://github.com/MetaMask/test-snaps/compare/v3.0.0...v3.0.1
[3.0.0]: https://github.com/MetaMask/test-snaps/compare/v2.0.0...v3.0.0
[2.0.0]: https://github.com/MetaMask/test-snaps/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/MetaMask/test-snaps/compare/v0.4.0...v1.0.0
[0.4.0]: https://github.com/MetaMask/test-snaps/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/MetaMask/test-snaps/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/MetaMask/test-snaps/compare/v0.1.3...v0.2.0
[0.1.3]: https://github.com/MetaMask/test-snaps/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/MetaMask/test-snaps/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/MetaMask/test-snaps/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/MetaMask/test-snaps/compare/v0.0.9...v0.1.0
[0.0.9]: https://github.com/MetaMask/test-snaps/compare/v0.0.8...v0.0.9
[0.0.8]: https://github.com/MetaMask/test-snaps/compare/v0.0.7...v0.0.8
[0.0.7]: https://github.com/MetaMask/test-snaps/compare/v0.0.4...v0.0.7
[0.0.4]: https://github.com/MetaMask/test-snaps/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/MetaMask/test-snaps/compare/v0.0.1...v0.0.3
[0.0.1]: https://github.com/MetaMask/test-snaps/releases/tag/v0.0.1
