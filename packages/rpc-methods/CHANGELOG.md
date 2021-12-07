# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.0]
### Added
- Added `title` and `subtitle` to `snap_confirm` ([#145](https://github.com/MetaMask/snaps-skunkworks/pull/145))

### Changed
- **BREAKING:** Update restricted RPC methods per new `PermissionController` ([#143](https://github.com/MetaMask/snaps-skunkworks/pull/143))
- Convert all TypeScript `interface` declarations to `type` equivalents ([#143](https://github.com/MetaMask/snaps-skunkworks/pull/143))
- Update restricted RPC methods per new permissions system ([#143](https://github.com/MetaMask/snaps-skunkworks/pull/143))

## [0.4.0]
### Changed
- **BREAKING:** Consolidate Snap state management methods into single method ([#135](https://github.com/MetaMask/snaps-skunkworks/pull/135))
  - `snap_manageState`
- **BREAKING:** Replace RPC method and permission description properties with docstrings ([#130](https://github.com/MetaMask/snaps-skunkworks/pull/130))

### Removed
- **BREAKING:** Remove `snap_manageAssets` ([#134](https://github.com/MetaMask/snaps-skunkworks/pull/134))

## [0.3.1]
### Changed
- No changes this release.

## [0.3.0]
### Changed
- **BREAKING:** Make `wallet_getBip44Entropy_*` implementation safer ([#115](https://github.com/MetaMask/snaps-skunkworks/pull/115))
  - Implemented by means of using [`@metamask/key-tree@^3.0.0](https://github.com/MetaMask/key-tree/releases/tag/v3.0.0)
- **BREAKING:** Enforce consistent naming for Snaps-related functionality ([#119](https://github.com/MetaMask/snaps-skunkworks/pull/119))

## [0.2.2]
### Fixed
- Package script issues ([#97](https://github.com/MetaMask/snaps-skunkworks/pull/97), [#98](https://github.com/MetaMask/snaps-skunkworks/pull/98))

## [0.2.0]
### Changed
- Update publish scripts ([#92](https://github.com/MetaMask/snaps-skunkworks/pull/92))

## [0.1.0]
### Added
- Readme file ([#71](https://github.com/MetaMask/snaps-skunkworks/pull/71))

### Changed
- **(BREAKING)** Rename package to `@metamask/rpc-methods` ([#73](https://github.com/MetaMask/snaps-skunkworks/pull/73))

## [0.0.6]
### Changed
- **(BREAKING)** Migrate `CommandEngine` message format to JSON-RPC ([#11](https://github.com/MetaMask/snaps-skunkworks/pull/11))
- **(BREAKING)** Use generic execution environment interface ([#19](https://github.com/MetaMask/snaps-skunkworks/pull/19))

## [0.0.5]
### Added
- First semi-stable release.

[Unreleased]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.2.2...v0.3.0
[0.2.2]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.2.0...v0.2.2
[0.2.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.0.6...v0.1.0
[0.0.6]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/MetaMask/snaps-skunkworks/releases/tag/v0.0.5
