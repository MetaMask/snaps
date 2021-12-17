# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.6.1]
### Fixed
- `snap_confirm` call ([#168](https://github.com/MetaMask/snaps-skunkworks/pull/168))
  - The Snap was passing invalid parameters to the method.

## [0.6.0]
### Added
- SVG icon ([#163](https://github.com/MetaMask/snaps-skunkworks/pull/163))
  - Adds an icon file at `images/icon.svg` and a reference to it in `snap.manifest.json`.

### Changed
- **BREAKING:** Support the new Snaps publishing specification ([#140](https://github.com/MetaMask/snaps-skunkworks/pull/140), [#157](https://github.com/MetaMask/snaps-skunkworks/pull/157))
  - This introduces several breaking changes to how Snaps are developed, hosted, and represented at runtime. See [the specification](https://github.com/MetaMask/specifications/blob/d4a5bf5d6990bb5b02a98bd3f95a24ffb28c701c/snaps/publishing.md) and the referenced pull requests for details.

## [0.4.0]
### Added
- Initial release.

[Unreleased]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.6.1...HEAD
[0.6.1]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.4.0...v0.6.0
[0.4.0]: https://github.com/MetaMask/snaps-skunkworks/releases/tag/v0.4.0
