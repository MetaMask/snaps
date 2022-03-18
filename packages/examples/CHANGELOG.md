# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.10.3]
### Uncategorized
- Add notification example snap ([#248](https://github.com/MetaMask/snaps-skunkworks/pull/248))
- Rename package directories ([#278](https://github.com/MetaMask/snaps-skunkworks/pull/278))

## [0.10.0]
### Changed
- **BREAKING:** Update config files per `@metamask/snaps-cli@0.10.0` ([#251](https://github.com/MetaMask/snaps-skunkworks/pull/251))

### Fixed
- Ensure that all examples work with the current Snaps implementation ([#219](https://github.com/MetaMask/snaps-skunkworks/pull/219))

## [0.9.0]
### Changed
- No changes this release.

## [0.8.0]
### Changed
- No changes this release.

## [0.7.0]
### Changed
- No changes this release.

## [0.6.3]
### Changed
- No changes this release.

## [0.6.2]
### Changed
- No changes this release.

## [0.6.1]
### Fixed
- `bls-signer` example Snap `snap_confirm` call ([#168](https://github.com/MetaMask/snaps-skunkworks/pull/168))
  - The `bls-signer` Snap was passing invalid parameters to the method.

## [0.6.0]
### Changed
- **BREAKING:** Support the new Snaps publishing specification ([#140](https://github.com/MetaMask/snaps-skunkworks/pull/140))
  - This introduces several breaking changes to how Snaps are developed, hosted, and represented at runtime. See [the specification](https://github.com/MetaMask/specifications/blob/d4a5bf5d6990bb5b02a98bd3f95a24ffb28c701c/snaps/publishing.md) and the referenced pull request for details.
- **BREAKING:** Update all example Snaps per new publishing specification ([#157](https://github.com/MetaMask/snaps-skunkworks/pull/157))

### Removed
- **BREAKING:** "hello-snaps` example ([#157](https://github.com/MetaMask/snaps-skunkworks/pull/157))

## [0.5.0]
### Changed
- No changes this release.

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

## [0.1.1]
### Added
- Add missing publish scripts to new packages

### Changed
- Fix examples compatibility issues

## [0.1.0]
### Changed
- Initial release ([#72](https://github.com/MetaMask/snaps-skunkworks/pull/72))
  - This package was previously a subset of [`snaps-cli`](https://github.com/MetaMask/snaps-cli/tree/main/examples), which has been renamed to [`@metamask/snaps-cli`](https://npmjs.com/package/@metamask/snaps-cli).
  - Some examples have been deleted because they were outdated.

[Unreleased]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.10.3...HEAD
[0.10.3]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.10.0...v0.10.3
[0.10.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.8.0...v0.9.0
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
[0.2.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/MetaMask/snaps-skunkworks/releases/tag/v0.1.0
