# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.1.0]
### Added
- Add `InputChangeEvent` event ([#2237](https://github.com/MetaMask/snaps/pull/2237))
- Add `error` prop to input component ([#2239](https://github.com/MetaMask/snaps/pull/2239))

## [3.0.1]
### Fixed
- Fix minor build configuration problems ([#2220](https://github.com/MetaMask/snaps/pull/2220))

## [3.0.0]
### Changed
- **BREAKING:** Update ESM build to be fully compliant with the ESM standard ([#2210](https://github.com/MetaMask/snaps/pull/2210))
- Bump `@metamask/rpc-errors` to `^6.2.1` ([#2209](https://github.com/MetaMask/snaps/pull/2209))

## [2.1.0]
### Changed
- Improve support for Snap errors without a message ([#2176](https://github.com/MetaMask/snaps/pull/2176))
  - You can now add data to an error without having to specify a message. For example:
    ```ts
    throw new MethodNotFoundError({ method: "some method name" });
    ```
- Strip empty `data` from Snap errors ([#2179](https://github.com/MetaMask/snaps/pull/2179))

## [2.0.0]
### Changed
- **BREAKING:** Update name lookup API types ([#2113](https://github.com/MetaMask/snaps/pull/2113))
  - The return value and the permission format has changed, see [SIP-12](https://metamask.github.io/SIPs/SIPS/sip-12) for more details.
- Add support for dynamic user interfaces ([#1465](https://github.com/MetaMask/snaps/pull/1465), [#2126](https://github.com/MetaMask/snaps/pull/2126), [#2143](https://github.com/MetaMask/snaps/pull/2143))
- Add support for snap defined execution timeouts ([#2098](https://github.com/MetaMask/snaps/pull/2098))

### Fixed
- Fix initial permissions types ([#2111](https://github.com/MetaMask/snaps/pull/2111))

## [1.4.0]
### Added
- Add support for signature insights ([#2074](https://github.com/MetaMask/snaps/pull/2074), [#2079](https://github.com/MetaMask/snaps/pull/2079))
- Add types for `snap_getClientStatus` ([#2051](https://github.com/MetaMask/snaps/pull/2051))

### Changed
- Bump @metamask/utils from 8.2.1 to 8.3.0 ([#2100](https://github.com/MetaMask/snaps/pull/2100))

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

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-sdk@3.1.0...HEAD
[3.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-sdk@3.0.1...@metamask/snaps-sdk@3.1.0
[3.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-sdk@3.0.0...@metamask/snaps-sdk@3.0.1
[3.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-sdk@2.1.0...@metamask/snaps-sdk@3.0.0
[2.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-sdk@2.0.0...@metamask/snaps-sdk@2.1.0
[2.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-sdk@1.4.0...@metamask/snaps-sdk@2.0.0
[1.4.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-sdk@1.3.2...@metamask/snaps-sdk@1.4.0
[1.3.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-sdk@1.3.1...@metamask/snaps-sdk@1.3.2
[1.3.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-sdk@1.3.0...@metamask/snaps-sdk@1.3.1
[1.3.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-sdk@1.2.0...@metamask/snaps-sdk@1.3.0
[1.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-sdk@1.1.0...@metamask/snaps-sdk@1.2.0
[1.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-sdk@1.0.0...@metamask/snaps-sdk@1.1.0
[1.0.0]: https://github.com/MetaMask/snaps/releases/tag/@metamask/snaps-sdk@1.0.0
