# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.0]
### Fixed
- Clean up post-termination timeouts ([#128](https://github.com/MetaMask/snaps-skunkworks/pull/128))

## [0.3.1]
### Fixed
- Correctly identify breaking changes in [0.3.0] release ([#123](https://github.com/MetaMask/snaps-skunkworks/pull/123))

## [0.3.0]
### Added
- Poll Snaps for their status ([#104](https://github.com/MetaMask/snaps-skunkworks/pull/104))
  - If a Snap stops responding, it will be forced to stop.

### Changed
- **BREAKING:** Enforce consistent naming for Snaps-related functionality ([#119](https://github.com/MetaMask/snaps-skunkworks/pull/119))
- **BREAKING:** Use the `ControllerMessenger` to communicate between the `SnapController` and its execution environment service ([#100](https://github.com/MetaMask/snaps-skunkworks/pull/100))

## [0.2.2]
### Added
- Snap error state ([#96](https://github.com/MetaMask/snaps-skunkworks/pull/96))

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

## [0.1.0]
### Added
- License and readme files ([#71](https://github.com/MetaMask/snaps-skunkworks/pull/71))

### Changed
- **(BREAKING)** Rename package to `@metamask/iframe-execution-environment-service` ([#73](https://github.com/MetaMask/snaps-skunkworks/pull/73))

## [0.0.8]
### Added
- JSON-RPC error support for iframe execution environment `executePlugin` ([#51](https://github.com/MetaMask/snaps-skunkworks/pull/51))

## [0.0.6]
### Added
- Initial release

[Unreleased]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.2.2...v0.3.0
[0.2.2]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.2.0...v0.2.2
[0.2.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.0.8...v0.1.0
[0.0.8]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.0.6...v0.0.8
[0.0.6]: https://github.com/MetaMask/snaps-skunkworks/releases/tag/v0.0.6
