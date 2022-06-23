# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.16.0]
### Added
- **BREAKING:** Encrypt Snap state by default ([#369](https://github.com/MetaMask/snaps-skunkworks/pull/369))
  - Breaks existing installed snaps that use `snap_manageState`. All such Snaps must be reinstalled.

### Changed
- **BREAKING:** Snaps are now required to export `onRpcRequest` to receive RPC requests ([#481](https://github.com/MetaMask/snaps-skunkworks/pull/481), [#533](https://github.com/MetaMask/snaps-skunkworks/pull/533), [#538](https://github.com/MetaMask/snaps-skunkworks/pull/538))
  - The type of the function is available in `@metamask/snap-types` as `OnRpcRequestHandler`.
- Snaps can no longer run timers outside of pending RPC requests ([#490](https://github.com/MetaMask/snaps-skunkworks/pull/490))

### Fixed
- Allow version matching with prerelease versions ([#508](https://github.com/MetaMask/snaps-skunkworks/pull/508))
- Fix issue with iframe error reporting ([#501](https://github.com/MetaMask/snaps-skunkworks/pull/501))
- Fix an issue with file paths with leading `./` in npm snap manifests ([#537](https://github.com/MetaMask/snaps-skunkworks/pull/537))

## [0.15.0]
### Fixed
- Fix an issue with detecting iframe execution environment load ([#464](https://github.com/MetaMask/snaps-skunkworks/pull/464))

## [0.14.0]
### Changed
- **BREAKING:** Increase TypeScript compilation target to ES2020 ([#449](https://github.com/MetaMask/snaps-skunkworks/pull/449))
  - This should not be breaking for consumers on any non-deprecated browser or Node.js version.

## [0.13.0]
### Added
- Add long-running endowment permission ([#386](https://github.com/MetaMask/snaps-skunkworks/pull/386))
- Add `network-access` endowment from `controllers` ([#439](https://github.com/MetaMask/snaps-skunkworks/pull/439))

### Changed
- **BREAKING:** Rename SnapController constructor argument ([#435](https://github.com/MetaMask/snaps-skunkworks/pull/435))

## [0.12.0]
### Added
- Add support for endowment teardown ([#407](https://github.com/MetaMask/snaps-skunkworks/pull/407))
- Emit `snapTerminated` event ([#406](https://github.com/MetaMask/snaps-skunkworks/pull/406))
- Add `IframeExecutionService` previously published via `@metamask/iframe-execution-environment-service` ([#415](https://github.com/MetaMask/snaps-skunkworks/pull/415))

### Removed
- Remove `_createWindowTimeout` ([#404](https://github.com/MetaMask/snaps-skunkworks/pull/404))
- Remove unresponsive timeout ([#395](https://github.com/MetaMask/snaps-skunkworks/pull/395))

### Fixed
- Correctly categorize ungracefully terminated snaps as crashed ([#427](https://github.com/MetaMask/snaps-skunkworks/pull/427))

## [0.11.1]
### Changed
- Always bind `fetch` by default ([#402](https://github.com/MetaMask/snaps-skunkworks/pull/402))

## [0.11.0]
### Added
- Add clearSnapState ([#346](https://github.com/MetaMask/snaps-skunkworks/pull/346))

### Changed
- Robustify snap startup procedure and iframe error handling ([#379](https://github.com/MetaMask/snaps-skunkworks/pull/379))
- Added ability to update snaps when installing them ([#322](https://github.com/MetaMask/snaps-skunkworks/pull/322))
- **BREAKING:** Use PermissionController:revokePermissionForAllSubjects ([#351](https://github.com/MetaMask/snaps-skunkworks/pull/351))
- Changed console.logs to console.info ([#361](https://github.com/MetaMask/snaps-skunkworks/pull/361))
- Upgraded TypeScript version to minimum 4.4 ([#360](https://github.com/MetaMask/snaps-skunkworks/pull/360))
- Remove cross-fetch ([#349](https://github.com/MetaMask/snaps-skunkworks/pull/349))

### Fixed
- Fix idle timeout implementation ([#385](https://github.com/MetaMask/snaps-skunkworks/pull/385))

## [0.10.7]
### Added
- Add version history information ([#317](https://github.com/MetaMask/snaps-skunkworks/pull/317))
- Add setInterval and clearInterval as default endowments ([#326](https://github.com/MetaMask/snaps-skunkworks/pull/326))
- Add queue for RPC requests to starting snaps ([#288](https://github.com/MetaMask/snaps-skunkworks/pull/288))
  - This improves the experience of invoking a starting snap, waiting for the snap to be ready instead of throwing an error.

### Changed
- **BREAKING:** Bump minimum Node version from 12 to 14 ([#331](https://github.com/MetaMask/snaps-skunkworks/pull/331))

## [0.10.6]
### Fixed
- Fix ID validation during Snap installation ([#308](https://github.com/MetaMask/snaps-skunkworks/pull/308))

## [0.10.5]
### Added
- Add updateSnap function to SnapController ([#259](https://github.com/MetaMask/snaps-skunkworks/pull/259))

### Fixed
- Fix issue where installation errors were repeatedly thrown ([#301](https://github.com/MetaMask/snaps-skunkworks/pull/301))
- Fix snap crash handling ([#298](https://github.com/MetaMask/snaps-skunkworks/pull/298))

## [0.10.3]
### Changed
- Always reinstall local snaps ([#289](https://github.com/MetaMask/snaps-skunkworks/pull/289))

## [0.10.2]
### Fixed
- Installation failure ([#279](https://github.com/MetaMask/snaps-skunkworks/pull/279))
  - A faulty installation script in a dependency caused the installation of this package to fail.

## [0.10.1]
### Changed
- Populate `jsonrpc` field in Snap RPC requests ([#273](https://github.com/MetaMask/snaps-skunkworks/pull/273))

### Fixed
- Various bugs ([#275](https://github.com/MetaMask/snaps-skunkworks/pull/275))
  - Snap fetching during installation.
  - Snap removal when cancelling a Snap installation request.

## [0.10.0]
### Added
- Allow specifying a version range when installing snap ([#250](https://github.com/MetaMask/snaps-skunkworks/pull/250))
- Add more safe default endowments to snaps ([#252](https://github.com/MetaMask/snaps-skunkworks/pull/252))

### Changed
- **BREAKING:** Specify all endowments in the `SnapController` ([#252](https://github.com/MetaMask/snaps-skunkworks/pull/252)), ([#266](https://github.com/MetaMask/snaps-skunkworks/pull/266))
  - Previously, default endowments were specified in the execution environment. Now, default endowments are specified in the `SnapController`, and the execution environment will only add endowments specified by the execution command, except for the `wallet` API object.
- Disable caching when fetching local snaps ([#227](https://github.com/MetaMask/snaps-skunkworks/pull/227))
  - This ensures that the `SnapController` will always fetch the latest snap manifest and source code during local development.

### Removed
- **BREAKING:** Remove the `PermissionController` and `SubjectMetadataController` ([#261](https://github.com/MetaMask/snaps-skunkworks/pull/261))
  - They are part of the [`@metamask/controllers`](https://npmjs.com/package/@metamask/controllers) as of version [26.0.0](https://github.com/MetaMask/controllers/releases/tag/v26.0.0) of that package.

### Fixed
- Prevent useless errors from being thrown when a snap is removed ([#215](https://github.com/MetaMask/snaps-skunkworks/pull/215))

## [0.9.0]
### Added
- Make `SnapController` npm registry configurable ([#200](https://github.com/MetaMask/snaps-skunkworks/pull/200))

### Changed
- **BREAKING:** Return `null` from `SnapController.getSnapState` if the snap has no state ([#203](https://github.com/MetaMask/snaps-skunkworks/pull/203))
  - Previously it would return `undefined` in this case.
- `@metamask/controllers@^25.1.0` ([#207](https://github.com/MetaMask/snaps-skunkworks/pull/207))

## [0.8.1]
### Added
- A variety of `SnapController` actions ([#199](https://github.com/MetaMask/snaps-skunkworks/pull/199))

## [0.8.0]
### Added
- Expose more `PermissionController` functionality via actions ([#194](https://github.com/MetaMask/snaps-skunkworks/pull/194))

### Changed
- **BREAKING:** Replace `PermissionController` functions with actions in `SnapController` ([#194](https://github.com/MetaMask/snaps-skunkworks/pull/194))

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
- **BREAKING:** Rename package to `@metamask/snap-controllers` ([#73](https://github.com/MetaMask/snaps-skunkworks/pull/73))

## [0.0.9]
### Added
- `PluginController`: Always persist plugin `isRunning` state as `false` ([#64](https://github.com/MetaMask/snaps-skunkworks/pull/64))
  - Plugins are not automatically running on boot, and we should never persist this state as `true`.

### Changed
- **BREAKING:** `@metamask/controllers@15.0.0` ([#66](https://github.com/MetaMask/snaps-skunkworks/pull/66))
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
- **BREAKING:** Migrate `CommandEngine` message format to JSON-RPC ([#11](https://github.com/MetaMask/snaps-skunkworks/pull/11))
- **BREAKING:** Refactor `PluginController` to use `BaseControllerV2` ([#13](https://github.com/MetaMask/snaps-skunkworks/pull/13))
- **BREAKING:** Use generic execution environment interface ([#19](https://github.com/MetaMask/snaps-skunkworks/pull/19))
- **BREAKING:** Restore origin parameter to `setupWorkerConnection`, rename to `setupPluginProvider` ([#20](https://github.com/MetaMask/snaps-skunkworks/pull/20))
- **BREAKING:** Rename some execution environment methods ([#23](https://github.com/MetaMask/snaps-skunkworks/pull/23))

### Fixed
- Ensure that the plugin `isRunning` check always runs when a plugin is started ([#21](https://github.com/MetaMask/snaps-skunkworks/pull/21))

## [0.0.5]
### Added
- First semi-stable release.

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
[0.10.5]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.10.3...v0.10.5
[0.10.3]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.10.2...v0.10.3
[0.10.2]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.10.1...v0.10.2
[0.10.1]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.10.0...v0.10.1
[0.10.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.8.1...v0.9.0
[0.8.1]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.8.0...v0.8.1
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
