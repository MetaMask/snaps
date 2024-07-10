# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Uncategorized

- fix: Add typed union validation ([#2534](https://github.com/MetaMask/snaps/pull/2534))
- feat: Card component ([#2480](https://github.com/MetaMask/snaps/pull/2480))
- Add support for custom dialogs in `snaps-jest` ([#2526](https://github.com/MetaMask/snaps/pull/2526))
- Support JSX and Interactive UI in simulator ([#2409](https://github.com/MetaMask/snaps/pull/2409))
- Add `Container` and `Footer` components ([#2517](https://github.com/MetaMask/snaps/pull/2517))
- Support conditional children in most JSX components ([#2506](https://github.com/MetaMask/snaps/pull/2506))
- feat!: Checkbox component ([#2501](https://github.com/MetaMask/snaps/pull/2501))
- BREAKING: Move form submit `files` to `value` property ([#2504](https://github.com/MetaMask/snaps/pull/2504))
- feat: support additional components inside forms ([#2497](https://github.com/MetaMask/snaps/pull/2497))
- Add `Tooltip` component ([#2490](https://github.com/MetaMask/snaps/pull/2490))
- Add file input component ([#2469](https://github.com/MetaMask/snaps/pull/2469))
- feat: Add text alignment prop ([#2489](https://github.com/MetaMask/snaps/pull/2489))
- fix: Correct Row variant in JSX ([#2486](https://github.com/MetaMask/snaps/pull/2486))
- feat: Allow row tooltips ([#2483](https://github.com/MetaMask/snaps/pull/2483))
- feat: Support nested children in JSX ([#2482](https://github.com/MetaMask/snaps/pull/2482))
- fix: Revert requiring at least one child ([#2481](https://github.com/MetaMask/snaps/pull/2481))
- chore!: Simplify SVG validation ([#2475](https://github.com/MetaMask/snaps/pull/2475))
- Require at least 1 child in JSX components ([#2466](https://github.com/MetaMask/snaps/pull/2466))
- feat: Add value component ([#2435](https://github.com/MetaMask/snaps/pull/2435))
- feat: add dropdown component ([#2420](https://github.com/MetaMask/snaps/pull/2420))
- feat: add `context` field to `snap_createInterface` ([#2413](https://github.com/MetaMask/snaps/pull/2413))
- fix: correct validation for children of Box component ([#2423](https://github.com/MetaMask/snaps/pull/2423))
- feat: add box positioning props ([#2422](https://github.com/MetaMask/snaps/pull/2422))
- chore(devdeps): @lavamoat/allow-scripts@^3.0.3>^3.0.4 ([#2418](https://github.com/MetaMask/snaps/pull/2418))
- feat: add button within input field ([#2407](https://github.com/MetaMask/snaps/pull/2407))
- Add JSX support for custom UI ([#2258](https://github.com/MetaMask/snaps/pull/2258))
- Allow `null` in `FormSubmitEventStruct` form state ([#2333](https://github.com/MetaMask/snaps/pull/2333))

## [1.1.2]

### Changed

- Use error wrappers ([#2178](https://github.com/MetaMask/snaps/pull/2178))

## [1.1.1]

### Changed

- Remove snap icon ([#2189](https://github.com/MetaMask/snaps/pull/2189))

## [1.1.0]

### Changed

- Use `@metamask/snaps-sdk` package ([#1946](https://github.com/MetaMask/snaps/pull/1946))
  - This package replaces the `@metamask/snaps-types` and
  - `@metamask/snaps-ui` packages, and is much more lightweight.

## [1.0.1]

### Fixed

- Fix missing files in package.json ([#1894](https://github.com/MetaMask/snaps/pull/1894))

## [1.0.0]

### Added

- Add `snap_getFile` example Snap ([#1836](https://github.com/MetaMask/snaps/pull/1836), [#1858](https://github.com/MetaMask/snaps/pull/1858))

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/get-file-example-snap@1.1.2...HEAD
[1.1.2]: https://github.com/MetaMask/snaps/compare/@metamask/get-file-example-snap@1.1.1...@metamask/get-file-example-snap@1.1.2
[1.1.1]: https://github.com/MetaMask/snaps/compare/@metamask/get-file-example-snap@1.1.0...@metamask/get-file-example-snap@1.1.1
[1.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/get-file-example-snap@1.0.1...@metamask/get-file-example-snap@1.1.0
[1.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/get-file-example-snap@1.0.0...@metamask/get-file-example-snap@1.0.1
[1.0.0]: https://github.com/MetaMask/snaps/releases/tag/@metamask/get-file-example-snap@1.0.0
