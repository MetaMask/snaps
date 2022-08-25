# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.20.0]
### Uncategorized
- BREAKING: Simplify manifest format for permission caveats ([#705](https://github.com/MetaMask/snaps-skunkworks/pull/705))
- Reduce TypeScript compilation target for `snap-controllers` ([#708](https://github.com/MetaMask/snaps-skunkworks/pull/708))
- BREAKING: Transaction Insight API ([#642](https://github.com/MetaMask/snaps-skunkworks/pull/642))
- Move all internal types from @metamask/snap-types to @metamask/snap-utils ([#695](https://github.com/MetaMask/snaps-skunkworks/pull/695))

## [0.19.1]
### Added
- Generate source maps from modified code ([#615](https://github.com/MetaMask/snaps-skunkworks/pull/615))

## [0.19.0]
### Changed
- Move eval functionality to utils package ([#666](https://github.com/MetaMask/snaps-skunkworks/pull/666))
- Move manifest handling functionality to utils ([#652](https://github.com/MetaMask/snaps-skunkworks/pull/652))
- Move JSON schemas and controller utils to utils package ([#623](https://github.com/MetaMask/snaps-skunkworks/pull/623))

### Fixed
- Fixed missing AbortSignal in default endowments ([#682](https://github.com/MetaMask/snaps-skunkworks/pull/682))

## [0.18.1]
### Changed
- No changes this release.

## [0.18.0]
### Changed
- Reduce TypeScript compilation target to ES2017 ([#628](https://github.com/MetaMask/snaps-skunkworks/pull/628))

## [0.17.0]
### Changed
- **BREAKING:** Bump minimum Node version to 16 ([#601](https://github.com/MetaMask/snaps-skunkworks/pull/601))

## [0.16.0]
### Changed
- No changes this release.

## [0.15.0]
### Fixed
- Fix an issue where comment stripping would break for large files ([#468](https://github.com/MetaMask/snaps-skunkworks/pull/468))

## [0.14.0]
### Changed
- **BREAKING:** Increase TypeScript compilation target to ES2020 ([#449](https://github.com/MetaMask/snaps-skunkworks/pull/449))
  - This should not be breaking for consumers on any non-deprecated browser or Node.js version.

## [0.13.0]
### Changed
- No changes this release.

## [0.12.0]
### Added
- Initial release ([#410](https://github.com/MetaMask/snaps-skunkworks/pull/410), [#421](https://github.com/MetaMask/snaps-skunkworks/pull/421))

[Unreleased]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.20.0...HEAD
[0.20.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.19.1...v0.20.0
[0.19.1]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.19.0...v0.19.1
[0.19.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.18.1...v0.19.0
[0.18.1]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.18.0...v0.18.1
[0.18.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.17.0...v0.18.0
[0.17.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.16.0...v0.17.0
[0.16.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.15.0...v0.16.0
[0.15.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.14.0...v0.15.0
[0.14.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.13.0...v0.14.0
[0.13.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.12.0...v0.13.0
[0.12.0]: https://github.com/MetaMask/snaps-skunkworks/releases/tag/v0.12.0
