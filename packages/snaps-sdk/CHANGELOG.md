# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.2]
### Fixed
- Fix missing `sensitive` property in `Copyable` type ([#2070](https://github.com/MetaMask/snaps/pull/2070))

## [1.3.1]
### Fixed
- Export error wrappers ([#2043](https://github.com/MetaMask/snaps/pull/2043))

## [1.3.0]
### Added
- Add image fetching utility functions ([#1995](https://github.com/MetaMask/snaps/pull/1995))
  - This adds two functions:
    - `getImageComponent` to get an `image` component from a PNG or JPEG URL.
    - `getImageData` to get a base64 data string, which can be embedded in an SVG image.

## [1.2.0]
### Added
- Add `row` and `address` component ([#1968](https://github.com/MetaMask/snaps/pull/1968))
- Add `enumValue`, `literal` and `union` from `snaps-utils` ([#1968](https://github.com/MetaMask/snaps/pull/1968))

### Changed
- Bump several MetaMask dependencies ([#1964](https://github.com/MetaMask/snaps/pull/1964))

## [1.1.0]
### Added
- Add Snap error wrappers of JSON-RPC errors ([#1924](https://github.com/MetaMask/snaps/pull/1924))

## [1.0.0]
### Added
- Initial release of this package.

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-sdk@1.3.2...HEAD
[1.3.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-sdk@1.3.1...@metamask/snaps-sdk@1.3.2
[1.3.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-sdk@1.3.0...@metamask/snaps-sdk@1.3.1
[1.3.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-sdk@1.2.0...@metamask/snaps-sdk@1.3.0
[1.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-sdk@1.1.0...@metamask/snaps-sdk@1.2.0
[1.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-sdk@1.0.0...@metamask/snaps-sdk@1.1.0
[1.0.0]: https://github.com/MetaMask/snaps/releases/tag/@metamask/snaps-sdk@1.0.0
