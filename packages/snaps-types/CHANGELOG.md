# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.30.0]
### Changed
- No changes this release.

## [0.29.0]
### Added
- **BREAKING:** Improve request function types ([#1014](https://github.com/MetaMask/snaps-monorepo/pull/1014))
  - New types re-exported from `rpc-methods`: `DialogType`, `NotificationType` and `SnapsGlobalObject`
  - `snap.request` is now strongly typed

## [0.28.0]
### Changed
- No changes this release.

## [0.27.1]
### Changed
- No changes this release.

## [0.27.0]
### Changed
- **BREAKING:** Move all internal types from `snaps-types` to `snaps-utils` ([#1060](https://github.com/MetaMask/snaps-monorepo/pull/1060))

## [0.26.2]
### Changed
- No changes this release.

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

### Changed
- **BREAKING:** Remove `wallet` global in favor of `snap` and `ethereum` ([#939](https://github.com/MetaMask/snaps-monorepo/pull/939), [#964](https://github.com/MetaMask/snaps-monorepo/pull/964))
- **BREAKING:** Rename package to start with `snaps-` ([#937](https://github.com/MetaMask/snaps-monorepo/pull/937))

## [0.23.0]
### Added
- Add snap cronjobs ([#651](https://github.com/MetaMask/snaps-monorepo/pull/651))

## [0.22.3]
### Changed
- No changes this release.

## [0.22.2]
### Changed
- No changes this release.

## [0.22.1]
### Changed
- No changes this release.

## [0.22.0]
### Added
- Added `SnapKeyring` types ([#728](https://github.com/MetaMask/snaps-monorepo/pull/728))

## [0.21.0]
### Removed
- **BREAKING:** Remove origin parameter from transaction insight payload ([#730](https://github.com/MetaMask/snaps-monorepo/pull/730))

### Fixed
- Fix missing dependencies ([#718](https://github.com/MetaMask/snaps-monorepo/pull/718))

## [0.20.0]
### Added
- **BREAKING:** Add Transaction Insight API ([#642](https://github.com/MetaMask/snaps-monorepo/pull/642))

### Removed
- **BREAKING:** Move all internal types from `@metamask/snaps-types` to `@metamask/snaps-utils` ([#695](https://github.com/MetaMask/snaps-monorepo/pull/695))
  - Previously accessible types can now be accessed by importing `@metamask/snaps-utils`

## [0.19.1]
### Changed
- No changes this release.

## [0.19.0]
### Changed
- No changes this release.

## [0.18.1]
### Changed
- No changes this release.

## [0.18.0]
### Changed
- Reduce TypeScript compilation target to ES2017 ([#628](https://github.com/MetaMask/snaps-monorepo/pull/628))

## [0.17.0]
### Changed
- **BREAKING:** Bump minimum Node version to 16 ([#601](https://github.com/MetaMask/snaps-monorepo/pull/601))

### Removed
- Remove `ErrorMessageEvent` and `ExecutionServiceMessenger` types ([#486](https://github.com/MetaMask/snaps-monorepo/pull/486))
  - These types are now available via `@metamask/snaps-controllers`

## [0.16.0]
### Added
- Add `OnRpcRequestHandler` type ([#534](https://github.com/MetaMask/snaps-monorepo/pull/534), [#531](https://github.com/MetaMask/snaps-monorepo/pull/531), [#538](https://github.com/MetaMask/snaps-monorepo/pull/538), [#533](https://github.com/MetaMask/snaps-monorepo/pull/533))

### Changed
- **BREAKING:** Change `SnapRpcHandler` type to reflect new function signature ([#534](https://github.com/MetaMask/snaps-monorepo/pull/534), [#533](https://github.com/MetaMask/snaps-monorepo/pull/533), [#481](https://github.com/MetaMask/snaps-monorepo/pull/481))

### Removed
- **BREAKING:** Remove `wallet.registerRpcMessageHandler` [#481](https://github.com/MetaMask/snaps-monorepo/pull/481)

## [0.15.0]
### Added
- Add type for `wallet` global ([#443](https://github.com/MetaMask/snaps-monorepo/pull/443))

## [0.14.0]
### Changed
- No changes this release.

## [0.13.0]
### Changed
- No changes this release.

## [0.12.0]
### Removed
- **BREAKING:** Remove `UnresponsiveMessageEvent` ([#395](https://github.com/MetaMask/snaps-monorepo/pull/395))

## [0.11.1]
### Changed
- No changes this release.

## [0.11.0]
### Changed
- **BREAKING:** Use PermissionController:revokePermissionForAllSubjects ([#351](https://github.com/MetaMask/snaps-monorepo/pull/351))

## [0.10.7]
### Changed
- **BREAKING:** Bump minimum Node version from 12 to 14 ([#331](https://github.com/MetaMask/snaps-monorepo/pull/331))

## [0.10.6]
### Changed
- No changes this release.

## [0.10.5]
### Changed
- No changes this release.

## [0.10.3]
### Changed
- No changes this release.

## [0.10.1]
### Fixed
- Removed deprecated package ([#272](https://github.com/MetaMask/snaps-monorepo/pull/272))
  - This package now uses the functionally equivalent `@metamask/providers` instead of the deprecated `@metamask/inpage-provider`.

## [0.10.0]
### Changed
- No changes this release.

## [0.9.0]
### Changed
- `@metamask/controllers@^25.1.0` ([#207](https://github.com/MetaMask/snaps-monorepo/pull/207))
  - This may affect some types in this package.

## [0.8.0]
### Changed
- No changes this release.

## [0.7.0]
### Changed
- **BREAKING:** Rename `ServiceMessenger` events to `ExecutionService` ([#188](https://github.com/MetaMask/snaps-monorepo/pull/188))

## [0.6.3]
### Changed
- No changes this release.

## [0.6.2]
### Changed
- No changes this release.

## [0.6.1]
### Changed
- No changes this release.

## [0.6.0]
### Added
- `SnapExecutionData` type ([#155](https://github.com/MetaMask/snaps-monorepo/pull/155))

### Changed
- **BREAKING:** Rename Snap `name` property to `id` ([#147](https://github.com/MetaMask/snaps-monorepo/pull/147))

## [0.5.0]
### Changed
- **BREAKING:** Convert all TypeScript `interface` declarations to `type` equivalents ([#143](https://github.com/MetaMask/snaps-monorepo/pull/143))

## [0.4.0]
### Changed
- No changes this release.

## [0.3.1]
### Changed
- No changes this release.

## [0.3.0]
### Added
- `UnresponsiveMessageEvent` ([#104](https://github.com/MetaMask/snaps-monorepo/pull/104))
- `ErrorMessageEvent`, `ServiceMessenger` ([#100](https://github.com/MetaMask/snaps-monorepo/pull/100))

### Changed
- **BREAKING:** Enforce consistent naming for Snaps-related functionality ([#119](https://github.com/MetaMask/snaps-monorepo/pull/119))

## [0.2.2]
### Fixed
- Package script issues ([#97](https://github.com/MetaMask/snaps-monorepo/pull/97), [#98](https://github.com/MetaMask/snaps-monorepo/pull/98))


## [0.2.0]
### Changed
- Update publish scripts ([#92](https://github.com/MetaMask/snaps-monorepo/pull/92))

## [0.1.0]
### Added
- Readme file ([#71](https://github.com/MetaMask/snaps-monorepo/pull/71))

### Changed
- **BREAKING:** Rename package to `@metamask/snaps-types` ([#73](https://github.com/MetaMask/snaps-monorepo/pull/73))

## [0.0.6]

## [0.0.5]
### Added
- Initial release

[Unreleased]: https://github.com/MetaMask/snaps-monorepo/compare/v0.30.0...HEAD
[0.30.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.29.0...v0.30.0
[0.29.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.28.0...v0.29.0
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
[0.10.5]: https://github.com/MetaMask/snaps-monorepo/compare/v0.10.3...v0.10.5
[0.10.3]: https://github.com/MetaMask/snaps-monorepo/compare/v0.10.1...v0.10.3
[0.10.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.10.0...v0.10.1
[0.10.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.6.3...v0.7.0
[0.6.3]: https://github.com/MetaMask/snaps-monorepo/compare/v0.6.2...v0.6.3
[0.6.2]: https://github.com/MetaMask/snaps-monorepo/compare/v0.6.1...v0.6.2
[0.6.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.2.2...v0.3.0
[0.2.2]: https://github.com/MetaMask/snaps-monorepo/compare/v0.2.0...v0.2.2
[0.2.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.0.6...v0.1.0
[0.0.6]: https://github.com/MetaMask/snaps-monorepo/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/MetaMask/snaps-monorepo/releases/tag/v0.0.5
