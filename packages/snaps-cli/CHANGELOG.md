# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.6.1]
### Uncategorized
- Fix build and publish scripts ([#169](https://github.com/MetaMask/snaps-skunkworks/pull/169))
- Fix various 0.6.0 bugs ([#168](https://github.com/MetaMask/snaps-skunkworks/pull/168))
- Fix snaps-cli init template generation ([#165](https://github.com/MetaMask/snaps-skunkworks/pull/165))

## [0.6.0]
### Added
- Snap SVG icon support ([#163](https://github.com/MetaMask/snaps-skunkworks/pull/163))

### Changed
- **BREAKING:** Support the new Snaps publishing specification ([#140](https://github.com/MetaMask/snaps-skunkworks/pull/140), [#160](https://github.com/MetaMask/snaps-skunkworks/pull/160))
  - This introduces several breaking changes to how Snaps are developed, hosted, and represented at runtime. See [the specification](https://github.com/MetaMask/specifications/blob/d4a5bf5d6990bb5b02a98bd3f95a24ffb28c701c/snaps/publishing.md) and the referenced pull requests for details.
- **BREAKING:** Rename Snap `name` property to `id` ([#147](https://github.com/MetaMask/snaps-skunkworks/pull/147))
- **BREAKING:** Update `ses` to version `^0.15.3` ([#159](https://github.com/MetaMask/snaps-skunkworks/pull/159))
  - This will cause behavioral changes for code executed under SES, and may require modifications to code that previously executed without issues.

## [0.5.0]
### Changed
- **BREAKING:** Convert all TypeScript `interface` declarations to `type` equivalents ([#143](https://github.com/MetaMask/snaps-skunkworks/pull/143))

## [0.4.0]
### Fixed
- Make Windows-compatible ([#131](https://github.com/MetaMask/snaps-skunkworks/pull/131))

## [0.3.1]
### Changed
- No changes this release.

## [0.3.0]
### Changed
- **BREAKING:** Enforce consistent naming for Snaps-related functionality ([#119](https://github.com/MetaMask/snaps-skunkworks/pull/119))

## [0.2.2]
### Fixed
- Package script issues ([#97](https://github.com/MetaMask/snaps-skunkworks/pull/97), [#98](https://github.com/MetaMask/snaps-skunkworks/pull/98))

## [0.2.1]
### Fixed
- Snap produced by `mm-snap init` ([#94](https://github.com/MetaMask/snaps-skunkworks/pull/94))
  - The template used to create the "Hello, world!" snap had become outdated due to a build-time bug.

## [0.2.0]
### Changed
- Update publish scripts ([#92](https://github.com/MetaMask/snaps-skunkworks/pull/92))

## [0.1.1]
### Added
- Missing publish scripts to new packages

## [0.1.0]
### Changed
- **(BREAKING)** Rename package to `@metamask/snaps-cli` ([#72](https://github.com/MetaMask/snaps-skunkworks/pull/72))
  - This package was previously named [`snaps-cli`](https://npmjs.com/package/snaps-cli).
  - As part of the renaming, and due to the scope of the changes to both this package and MetaMask Snaps generally, its versioning and changelog have been reset. The original changelog can be found [here](https://github.com/MetaMask/snaps-cli/blob/main/CHANGELOG.md).

### Removed
- Example snaps ([#72](https://github.com/MetaMask/snaps-skunkworks/pull/72))
  - The examples now live in their own package, [`@metamask/snap-examples`](https://npmjs.com/package/@metamask/snap-examples).

[Unreleased]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.6.1...HEAD
[0.6.1]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.2.2...v0.3.0
[0.2.2]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/MetaMask/snaps-skunkworks/releases/tag/v0.1.0
