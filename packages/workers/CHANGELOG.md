# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.6.1]
### Uncategorized
- Fix build and publish scripts ([#169](https://github.com/MetaMask/snaps-skunkworks/pull/169))

## [0.6.0]
### Changed
- **BREAKING:** Support the new Snaps publishing specification ([#140](https://github.com/MetaMask/snaps-skunkworks/pull/140))
  - This introduces several breaking changes to how Snaps are developed, hosted, and represented at runtime. See [the specification](https://github.com/MetaMask/specifications/blob/d4a5bf5d6990bb5b02a98bd3f95a24ffb28c701c/snaps/publishing.md) and the referenced pull requests for details.
- **BREAKING:** Rename Snap `name` property to `id` ([#147](https://github.com/MetaMask/snaps-skunkworks/pull/147))
- **BREAKING:** Update `ses` to version `^0.15.3` ([#159](https://github.com/MetaMask/snaps-skunkworks/pull/159))
  - This will cause behavioral changes for code executed under SES, and may require modifications to code that previously executed without issues.

## [0.5.0]
### Changed
- **BREAKING:** Convert all TypeScript `interface` declarations to `type` equivalents ([#143](https://github.com/MetaMask/snaps-skunkworks/pull/143))

## [0.4.0]
### Changed
- No changes this release.

## [0.3.1]
### Changed
- No changes this release.

## [0.3.0]
### Changed
- **BREAKING:** Enforce consistent naming for Snaps-related functionality ([#119](https://github.com/MetaMask/snaps-skunkworks/pull/119))

## [0.2.2]
### Fixed
- Package script issues ([#97](https://github.com/MetaMask/snaps-skunkworks/pull/97), [#98](https://github.com/MetaMask/snaps-skunkworks/pull/98))


## [0.2.0]
### Changed
- Update publish scripts ([#92](https://github.com/MetaMask/snaps-skunkworks/pull/92))

## [0.1.2]
### Changed
- Restore name of `handshake` method to `ping` ([#90](https://github.com/MetaMask/snaps-skunkworks/pull/90))

## [0.1.0]
### Changed
- **(BREAKING)** Rename package to `@metamask/snap-workers` ([#73](https://github.com/MetaMask/snaps-skunkworks/pull/73))

## [0.0.6]
### Added
- Execution environment OpenRPC spec ([#23](https://github.com/MetaMask/snaps-skunkworks/pull/23))

### Changed
- **(BREAKING)** Migrate `CommandEngine` message format to JSON-RPC ([#11](https://github.com/MetaMask/snaps-skunkworks/pull/11))
- **(BREAKING)** Rename some execution environment methods ([#23](https://github.com/MetaMask/snaps-skunkworks/pull/23))

## [0.0.5]
### Added
- Initial release

[Unreleased]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.6.1...HEAD
[0.6.1]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.2.2...v0.3.0
[0.2.2]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.2.0...v0.2.2
[0.2.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.1.0...v0.1.2
[0.1.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.0.6...v0.1.0
[0.0.6]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/MetaMask/snaps-skunkworks/releases/tag/v0.0.5
