# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.2.1]

### Uncategorized

- Replace `tsup` with `ts-bridge` ([#2682](https://github.com/MetaMask/snaps/pull/2682))
- Add support for more customizable input ([#2699](https://github.com/MetaMask/snaps/pull/2699))
- fix: Allow any element as the child of Container ([#2698](https://github.com/MetaMask/snaps/pull/2698))
- feat: Support nested unions in `typedUnion` ([#2693](https://github.com/MetaMask/snaps/pull/2693))
- Bump TypeScript and related dependencies ([#2690](https://github.com/MetaMask/snaps/pull/2690))
- feat: Allow CAIP-10 addresses in `Address` ([#2680](https://github.com/MetaMask/snaps/pull/2680))
- fix: Disallow images and icons in footers ([#2676](https://github.com/MetaMask/snaps/pull/2676))
- Add `Section` component ([#2672](https://github.com/MetaMask/snaps/pull/2672))
- feat: Add selector component ([#2645](https://github.com/MetaMask/snaps/pull/2645))
- Add `color` prop to `Text` component ([#2660](https://github.com/MetaMask/snaps/pull/2660))
- Button component now also allows Images and Icons ([#2641](https://github.com/MetaMask/snaps/pull/2641))
- Added icon component ([#2638](https://github.com/MetaMask/snaps/pull/2638))
- Release 62.0.0 ([#2629](https://github.com/MetaMask/snaps/pull/2629))
- fix: Add structs to `typedUnion` schema ([#2623](https://github.com/MetaMask/snaps/pull/2623))

## [2.2.0]

### Added

- Add `RadioGroup` to interactive UI example ([#2592](https://github.com/MetaMask/snaps/pull/2592))

## [2.1.0]

### Added

- Add `Checkbox` to interactive UI example ([#2515](https://github.com/MetaMask/snaps/pull/2515))

## [2.0.0]

### Changed

- **BREAKING:** Revamp interactive UI example using JSX ([#2427](https://github.com/MetaMask/snaps/pull/2427))
  - The `getState` RPC method was removed as part of this refactor.

## [1.0.2]

### Fixed

- Fix a crash when submitting an empty string ([#2333](https://github.com/MetaMask/snaps/pull/2333))

## [1.0.1]

### Changed

- Use error wrappers ([#2178](https://github.com/MetaMask/snaps/pull/2178))

## [1.0.0]

### Added

- Add interactive UI example Snap ([#2171](https://github.com/MetaMask/snaps/pull/2171))

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/interactive-ui-example-snap@2.2.1...HEAD
[2.2.1]: https://github.com/MetaMask/snaps/compare/@metamask/interactive-ui-example-snap@2.2.0...@metamask/interactive-ui-example-snap@2.2.1
[2.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/interactive-ui-example-snap@2.1.0...@metamask/interactive-ui-example-snap@2.2.0
[2.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/interactive-ui-example-snap@2.0.0...@metamask/interactive-ui-example-snap@2.1.0
[2.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/interactive-ui-example-snap@1.0.2...@metamask/interactive-ui-example-snap@2.0.0
[1.0.2]: https://github.com/MetaMask/snaps/compare/@metamask/interactive-ui-example-snap@1.0.1...@metamask/interactive-ui-example-snap@1.0.2
[1.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/interactive-ui-example-snap@1.0.0...@metamask/interactive-ui-example-snap@1.0.1
[1.0.0]: https://github.com/MetaMask/snaps/releases/tag/@metamask/interactive-ui-example-snap@1.0.0
