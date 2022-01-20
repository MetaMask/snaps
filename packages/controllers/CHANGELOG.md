# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.8.0]
### Uncategorized
- Remove example-snap package ([#195](https://github.com/MetaMask/snaps-skunkworks/pull/195))
- Added PermissionsController actions that are used in SnapController ([#194](https://github.com/MetaMask/snaps-skunkworks/pull/194))

## [0.7.0]
### Changed
- **BREAKING:** Rename execution environment service class and events ([#188](https://github.com/MetaMask/snaps-skunkworks/pull/188))
  - `ServiceMessenger` events are now named `ExecutionService`.
  - `WebWorkerExecutionEnvironmentService` is now named `WebWorkerExecutionService`.

## [0.6.3]
### Fixed
- Prevent `disableSnap` from throwing if the specified Snap is stopped ([#175](https://github.com/MetaMask/snaps-skunkworks/pull/175))

## [0.6.2]
### Changed
- **BREAKING:** Rename endowment permission builder exports ([#171](https://github.com/MetaMask/snaps-skunkworks/pull/171))

### Removed
- **BREAKING:** Remove the `svgIcon` property from Snap state ([#172](https://github.com/MetaMask/snaps-skunkworks/pull/172))
  - The SVG icon content string is instead emitted with the `SnapController:snapAdded` event.

## [0.6.1]
### Changed
- No changes this release.

## [0.6.0]
### Added
- "Endowment" permissions ([#152](https://github.com/MetaMask/snaps-skunkworks/pull/152))
- `SnapController` endowment permissions support ([#155](https://github.com/MetaMask/snaps-skunkworks/pull/155))
- Network access endowment permission ([#154](https://github.com/MetaMask/snaps-skunkworks/pull/154))
- Snap installation events ([#162](https://github.com/MetaMask/snaps-skunkworks/pull/162))

### Changed
- **BREAKING:** Refactor `SnapController` to support the new Snaps publishing specification ([#140](https://github.com/MetaMask/snaps-skunkworks/pull/140), [#157](https://github.com/MetaMask/snaps-skunkworks/pull/157), [#163](https://github.com/MetaMask/snaps-skunkworks/pull/163))
  - This introduces several breaking changes to how Snaps are developed, hosted, and represented at runtime. See [the specification](https://github.com/MetaMask/specifications/blob/d4a5bf5d6990bb5b02a98bd3f95a24ffb28c701c/snaps/publishing.md) and the referenced pull requests for details.
- **BREAKING:** Rename Snap `name` property to `id` ([#147](https://github.com/MetaMask/snaps-skunkworks/pull/147))
- **BREAKING:** Introduce the required `permissionType` field to `PermissionController` permission specifications ([#152](https://github.com/MetaMask/snaps-skunkworks/pull/152))
- Make `SubjectMetadataController` subject metadata `name` optional ([#151](https://github.com/MetaMask/snaps-skunkworks/pull/151))

### Removed
- **BREAKING:** Inline snap functionality ([#148](https://github.com/MetaMask/snaps-skunkworks/pull/148))

## [0.5.0]
### Changed
- **BREAKING:** Update restricted RPC methods per new `PermissionController` ([#143](https://github.com/MetaMask/snaps-skunkworks/pull/143))
- **BREAKING:** Convert all TypeScript `interface` declarations to `type` equivalents ([#143](https://github.com/MetaMask/snaps-skunkworks/pull/143))
- Bump `@metamask/obs-store` to `7.0.0` ([#144](https://github.com/MetaMask/snaps-skunkworks/pull/144))

## [0.4.0]
### Added
- `SubjectMetadataController` ([#61](https://github.com/MetaMask/snaps-skunkworks/pull/61))
- `PermissionController` ([#132](https://github.com/MetaMask/snaps-skunkworks/pull/132), [#141](https://github.com/MetaMask/snaps-skunkworks/pull/141))
- **BREAKING:** `SnapController`: Add max request processing time ([#128](https://github.com/MetaMask/snaps-skunkworks/pull/128))

### Fixed
- `SnapController`: Clean up timeouts after stopping a Snap ([#139](https://github.com/MetaMask/snaps-skunkworks/pull/139))
- `WebWorkerExecutionEnvironmentService`: Clean up post-termination timeouts ([#128](https://github.com/MetaMask/snaps-skunkworks/pull/128))

## [0.3.1]
### Changed
- **BREAKING:** Update Snap initial states ([#126](https://github.com/MetaMask/snaps-skunkworks/pull/126))
  - The `idle` status is now named `installing`, and rehydrated snaps will have the status `stopped`.

### Fixed
- Fix Snap execution and installation bugs ([#125](https://github.com/MetaMask/snaps-skunkworks/pull/125))
- Prevent Snaps from being started before installation is finished ([#124](https://github.com/MetaMask/snaps-skunkworks/pull/124))
- Correctly identify breaking changes in [0.3.0] release ([#123](https://github.com/MetaMask/snaps-skunkworks/pull/123))

## [0.3.0]
### Added
- Allow disabling and enabling Snaps ([#116](https://github.com/MetaMask/snaps-skunkworks/pull/116))
  - Only enabled Snaps can be started.
- Start stopped Snaps that receive an RPC message ([#114](https://github.com/MetaMask/snaps-skunkworks/pull/114))
- Add Snap max idle time ([#105](https://github.com/MetaMask/snaps-skunkworks/pull/105))
  - A Snap that is idle for more than the max idle time will be stopped.
- Poll Snaps for their status ([#104](https://github.com/MetaMask/snaps-skunkworks/pull/104))
  - If a Snap stops responding, it will be forced to stop.

### Changed
- **BREAKING:** Enforce consistent naming for Snaps-related functionality ([#119](https://github.com/MetaMask/snaps-skunkworks/pull/119))
- **BREAKING:** Use the `ControllerMessenger` to communicate between the `SnapController` and its execution environment service ([#100](https://github.com/MetaMask/snaps-skunkworks/pull/100))

## [0.2.2]
### Added
- Add Snap error state ([#96](https://github.com/MetaMask/snaps-skunkworks/pull/96))

### Fixed
- Package script issues ([#97](https://github.com/MetaMask/snaps-skunkworks/pull/97), [#98](https://github.com/MetaMask/snaps-skunkworks/pull/98))

## [0.2.0]
### Changed
- Update publish scripts ([#92](https://github.com/MetaMask/snaps-skunkworks/pull/92))

## [0.1.2]
### Changed
- Restore name of `handshake` method to `ping` ([#90](https://github.com/MetaMask/snaps-skunkworks/pull/90))

## [0.1.1]
### Added
- Out of band error support ([#88](https://github.com/MetaMask/snaps-skunkworks/pull/88))

### Changed
- @metamask/controllers@17.0.0 ([#87](https://github.com/MetaMask/snaps-skunkworks/pull/87))

## [0.1.0]
### Added
- Readme file ([#71](https://github.com/MetaMask/snaps-skunkworks/pull/71))

### Changed
- **(BREAKING)** Rename package to `@metamask/snap-controllers` ([#73](https://github.com/MetaMask/snaps-skunkworks/pull/73))

## [0.0.9]
### Added
- `PluginController`: Always persist plugin `isRunning` state as `false` ([#64](https://github.com/MetaMask/snaps-skunkworks/pull/64))
  - Plugins are not automatically running on boot, and we should never persist this state as `true`.

### Changed
- **(BREAKING)** `@metamask/controllers@15.0.0` ([#66](https://github.com/MetaMask/snaps-skunkworks/pull/66))
  - This may cause incompatibilities with other versions of the `@metamask/controllers` package.

## [0.0.7]
### Fixed
- Store plugin states in the correct place ([#48](https://github.com/MetaMask/snaps-skunkworks/pull/48))
  - Previously, plugin states would be set as top-level keys of the `PluginController`'s state. This broke retrieving plugin states. They are now correctly stored under `state.pluginStates`.

## [0.0.6]
### Added
- iframe execution environment ([#33](https://github.com/MetaMask/snaps-skunkworks/pull/33))
- Execution environment OpenRPC spec ([#23](https://github.com/MetaMask/snaps-skunkworks/pull/23))

### Changed
- **(BREAKING)** Migrate `CommandEngine` message format to JSON-RPC ([#11](https://github.com/MetaMask/snaps-skunkworks/pull/11))
- **(BREAKING)** Refactor `PluginController` to use `BaseControllerV2` ([#13](https://github.com/MetaMask/snaps-skunkworks/pull/13))
- **(BREAKING)** Use generic execution environment interface ([#19](https://github.com/MetaMask/snaps-skunkworks/pull/19))
- **(BREAKING)** Restore origin parameter to `setupWorkerConnection`, rename to `setupPluginProvider` ([#20](https://github.com/MetaMask/snaps-skunkworks/pull/20))
- **(BREAKING)** Rename some execution environment methods ([#23](https://github.com/MetaMask/snaps-skunkworks/pull/23))

### Fixed
- Ensure that the plugin `isRunning` check always runs when a plugin is started ([#21](https://github.com/MetaMask/snaps-skunkworks/pull/21))

## [0.0.5]
### Added
- First semi-stable release.

[Unreleased]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.8.0...HEAD
[0.8.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.6.3...v0.7.0
[0.6.3]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.6.2...v0.6.3
[0.6.2]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.6.1...v0.6.2
[0.6.1]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.2.2...v0.3.0
[0.2.2]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.2.0...v0.2.2
[0.2.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.0.9...v0.1.0
[0.0.9]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.0.7...v0.0.9
[0.0.7]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.0.6...v0.0.7
[0.0.6]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/MetaMask/snaps-skunkworks/releases/tag/v0.0.5
