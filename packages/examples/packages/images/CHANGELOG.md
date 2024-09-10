# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.1]
### Uncategorized
- feat: Add `selectiveUnion` for improved Superstruct error messaging ([#2696](https://github.com/MetaMask/snaps/pull/2696))
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
- fix: Add structs to `typedUnion` schema ([#2623](https://github.com/MetaMask/snaps/pull/2623))
- feat: Add RadioButton component ([#2592](https://github.com/MetaMask/snaps/pull/2592))
- chore(devDep): Bump `typescript` from `~4.8.4` to `~5.0.4` ([#2594](https://github.com/MetaMask/snaps/pull/2594))
- Replace `superstruct` with ESM-compatible fork `@metamask/superstruct` ([#2445](https://github.com/MetaMask/snaps/pull/2445))
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

## [1.1.0]
### Changed
- Add example showing how to import and use images ([#2284](https://github.com/MetaMask/snaps/pull/2284))
- Use error wrappers ([#2178](https://github.com/MetaMask/snaps/pull/2178))

## [1.0.0]
### Added
- Add images example Snap ([#2002](https://github.com/MetaMask/snaps/pull/2002))

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/images-example-snap@1.1.1...HEAD
[1.1.1]: https://github.com/MetaMask/snaps/compare/@metamask/images-example-snap@1.1.0...@metamask/images-example-snap@1.1.1
[1.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/images-example-snap@1.0.0...@metamask/images-example-snap@1.1.0
[1.0.0]: https://github.com/MetaMask/snaps/releases/tag/@metamask/images-example-snap@1.0.0
