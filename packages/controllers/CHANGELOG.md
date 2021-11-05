# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0]
### Added
- SnapController: Allow enabling / disabling snaps ([#116](https://github.com/MetaMask/snaps-skunkworks/pull/116))
- Start on-demand inside rpcMessageHandler ([#114](https://github.com/MetaMask/snaps-skunkworks/pull/114))
- Max idle time ([#105](https://github.com/MetaMask/snaps-skunkworks/pull/105))
- Poll for status webworker ([#104](https://github.com/MetaMask/snaps-skunkworks/pull/104))
- Service Messenger ([#100](https://github.com/MetaMask/snaps-skunkworks/pull/100))

### Changed
- Enforce consistent naming for Snaps ([#119](https://github.com/MetaMask/snaps-skunkworks/pull/119))


## [0.2.2]
### Added
- Added snap error state ([#96](https://github.com/MetaMask/snaps-skunkworks/pull/96))

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

[Unreleased]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.3.0...HEAD
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
