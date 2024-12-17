# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Uncategorized

- Add Banner UI component ([#2961](https://github.com/MetaMask/snaps-skunkworks.git/pull/2961))
- feat: Support `fontWeight` prop on `Text` ([#2959](https://github.com/MetaMask/snaps-skunkworks.git/pull/2959))
- Add `onSettingsPage` export ([#2911](https://github.com/MetaMask/snaps-skunkworks.git/pull/2911))
- feat: Add `size` prop to Button ([#2953](https://github.com/MetaMask/snaps-skunkworks.git/pull/2953))
- fix: Improve field validation errors ([#2937](https://github.com/MetaMask/snaps-skunkworks.git/pull/2937))
- Add loading variant for Snaps UI Button ([#2930](https://github.com/MetaMask/snaps-skunkworks.git/pull/2930))

## [6.13.0]

### Added

- Add `size` prop to `Text` ([#2908](https://github.com/MetaMask/snaps/pull/2908))
- Add JSX `content` property to `snap_notify` ([#2881](https://github.com/MetaMask/snaps/pull/2881))
  - This content will be displayed in an upcoming expanded view for notifications.

### Changed

- Allow `Field` in `Box` ([#2926](https://github.com/MetaMask/snaps/pull/2926))
- Bump `@metamask/key-tree` from `^9.1.2` to `^10.0.1` ([#2909](https://github.com/MetaMask/snaps/pull/2909))

## [6.12.0]

### Added

- Add `snap_getInterfaceContext` JSON-RPC method ([#2902](https://github.com/MetaMask/snaps/pull/2902))

## [6.11.0]

### Added

- Add support for `Address` in `Card` title ([#2894](https://github.com/MetaMask/snaps/pull/2894))

## [6.10.0]

### Added

- Add `snap_getCurrencyRate` to `SnapMethods` ([#2843](https://github.com/MetaMask/snaps/pull/2843))
- Add `truncate`, `displayName` and `avatar` props to `Address` component ([#2833](https://github.com/MetaMask/snaps/pull/2833))

### Changed

- Bump MetaMask dependencies ([#2853](https://github.com/MetaMask/snaps/pull/2853))

## [6.9.0]

### Added

- Add `sm` size variant to `Heading` component ([#2831](https://github.com/MetaMask/snaps/pull/2831))
- Add `min`, `max` and `step` props to number `Input` component ([#2821](https://github.com/MetaMask/snaps/pull/2821))
- Add `Avatar` component ([#2820](https://github.com/MetaMask/snaps/pull/2820))

### Removed

- Remove support for JSX in `snap_notify` notifications ([#2837](https://github.com/MetaMask/snaps/pull/2837))
  - This is technically a breaking change, but this feature was never actually
    implemented, so it should not affect any existing code.
  - This will be re-implemented in a future release.

## [6.8.0]

### Added

- Add `snap_experimentalProviderRequest` JSON-RPC method ([#2773](https://github.com/MetaMask/snaps/pull/2773))
  - This method is experimental and will likely be removed in a future release.

### Changed

- Allow updating interface context ([#2809](https://github.com/MetaMask/snaps/pull/2809))
  - `snap_updateInterface` now accepts a `context` parameter to update the
    context of an interface.
- Remove `eth_sign` ([#2772](https://github.com/MetaMask/snaps/pull/2772))
  - This method was removed from the MetaMask extension, so any references to it
    in Snaps can be removed.

### Removed

- Remove `AccountSelector` component ([#2794](https://github.com/MetaMask/snaps/pull/2794))
  - This is technically a breaking change, but the `AccountSelector` component was never actually implemented, so it
    should not affect any existing code.

## [6.7.0]

### Added

- Add `snap_getCurrencyRate` JSON-RPC method ([#2763](https://github.com/MetaMask/snaps/pull/2763))
- Add `AccountSelector` component ([#2764](https://github.com/MetaMask/snaps/pull/2764), [#2768](https://github.com/MetaMask/snaps/pull/2768))
- Add `size` prop to the `Heading` component ([#2759](https://github.com/MetaMask/snaps/pull/2759))

### Changed

- Allow `Link` in `Row` and `Address` in `Link` ([#2761](https://github.com/MetaMask/snaps/pull/2761))

## [6.6.0]

### Added

- Add support for `metamask:` schemed URLs ([#2719](https://github.com/MetaMask/snaps/pull/2719))
- Add support for JSX in `snap_notify` notifications ([#2706](https://github.com/MetaMask/snaps/pull/2706))

## [6.5.1]

### Fixed

- Fix package exports ([#2737](https://github.com/MetaMask/snaps/pull/2737))

## [6.5.0]

### Added

- Add `center` prop to `Box` component ([#2716](https://github.com/MetaMask/snaps/pull/2716))
- Add `form` prop to `Button` component ([#2712](https://github.com/MetaMask/snaps/pull/2712))
  - This allows the `Button` component to be used outside of forms, but still
    submit a form when clicked.

### Fixed

- Fix invalid types in type declaration in some cases ([#2714](https://github.com/MetaMask/snaps/pull/2714))
- Fix type issue with `Field` children ([#2715](https://github.com/MetaMask/snaps/pull/2715))
  - `Field` now accepts booleans and `null` as children, in addition to the
    existing types.

## [6.4.0]

### Added

- Add `Section` component ([#2672](https://github.com/MetaMask/snaps/pull/2672))
- Add support for element before input in the `Field` component ([#2699](https://github.com/MetaMask/snaps/pull/2699))

### Changed

- Allow CAIP-10 addresses in the `Address` component ([#2680](https://github.com/MetaMask/snaps/pull/2680))
- Improve error messaging ([#2696](https://github.com/MetaMask/snaps/pull/2696), [#2693](https://github.com/MetaMask/snaps/pull/2693))

### Fixed

- Allow any element as the child of the `Container` component ([#2698](https://github.com/MetaMask/snaps/pull/2698))
- Disallow images and icons in footers ([#2676](https://github.com/MetaMask/snaps/pull/2676))
- Fix ESM version of the package ([#2682](https://github.com/MetaMask/snaps/pull/2682))
  - This fixes the ESM version of the package to be fully compliant with the ESM
    standard.
- Bump `@metamask/utils` from `^9.1.0` to `^9.2.1` ([#2680](https://github.com/MetaMask/snaps/pull/2680))
- Bump other MetaMask dependencies ([#2703](https://github.com/MetaMask/snaps/pull/2703))

## [6.3.0]

### Added

- Add `Selector` component ([#2645](https://github.com/MetaMask/snaps/pull/2645))
- Add `Icon` component ([#2638](https://github.com/MetaMask/snaps/pull/2638))
- Add `color` prop to `Text` component ([#2660](https://github.com/MetaMask/snaps/pull/2660))

### Changed

- `Button` children are now allowed to be `Image` and `Icon` ([#2641](https://github.com/MetaMask/snaps/pull/2641))

## [6.2.1]

### Fixed

- Add structs to `typedUnion` schema ([#2623](https://github.com/MetaMask/snaps/pull/2623))

## [6.2.0]

### Added

- Add `snap_getPreferences` ([#2607](https://github.com/MetaMask/snaps/pull/2607))
- Add `RadioGroup` component ([#2592](https://github.com/MetaMask/snaps/pull/2592))

## [6.1.1]

### Changed

- Bump `@metamask/providers` from `17.0.0` to `^17.1.2` ([#2598](https://github.com/metamask/snaps/pull/2598))

## [6.1.0]

### Added

- Add non-restricted RPC method `snap_resolveInterface` ([#2509](https://github.com/metamask/snaps/pull/2509))
  - This method allows a Snap to resolve a given user interface bound to a `snap_dialog` with a custom value.
  - Add new types `ResolveInterfaceParams`, `ResolveInterfaceResult`.
- Add `Card` component ([#2480](https://github.com/metamask/snaps/pull/2480))
- Add `BoxChildStruct`, `FormChildStruct`, `FieldChildUnionStruct` ([#2409](https://github.com/metamask/snaps/pull/2409))
- Add `Container` and `Footer` components ([#2517](https://github.com/metamask/snaps/pull/2517))

### Changed

- Update `RootJSXElement` to allow `Container` or `Box` at the root ([#2526](https://github.com/metamask/snaps/pull/2526))
- Bump `@metamask/key-tree` from `^9.1.1` to `^9.1.2` ([#2445](https://github.com/MetaMask/snaps/pull/2445))
- Bump `@metamask/rpc-errors` from `^6.2.1` to `^6.3.1` ([#2445](https://github.com/MetaMask/snaps/pull/2445))
- Bump `@metamask/utils` from `^8.3.0` to `^9.1.0` ([#2445](https://github.com/MetaMask/snaps/pull/2445))

### Fixed

- Replace `superstruct` with ESM-compatible `@metamask/superstruct` `^3.1.0` ([#2445](https://github.com/MetaMask/snaps/pull/2445))
  - This fixes the issue of this package being unusable by any TypeScript project that uses `Node16` or `NodeNext` as its `moduleResolution` option.
- Set `@metamask/providers` from `^17.0.0` to `17.0.0` ([#2445](https://github.com/MetaMask/snaps/pull/2445))
  - `17.1.0` and `17.1.1` introduce regressions.

## [6.0.0]

### Added

- **BREAKING:** Add `FileInput` component ([#2469](https://github.com/MetaMask/snaps/pull/2469), [#2504](https://github.com/MetaMask/snaps/pull/2504))
  - `FormSubmitEvent` may now contain values of type `File`.
- **BREAKING:** Add `Checkbox` component ([#2501](https://github.com/MetaMask/snaps/pull/2501))
  - `FormSubmitEvent` and `InputChangeEvent` may now contain values of type `boolean`.
- Add `alignment` prop to `Text` ([#2489](https://github.com/MetaMask/snaps/pull/2489))
- Add `Tooltip` component ([#2490](https://github.com/MetaMask/snaps/pull/2490))
- Support additional components inside forms ([#2497](https://github.com/MetaMask/snaps/pull/2497))
- Support conditional children in most JSX components ([#2506](https://github.com/MetaMask/snaps/pull/2506))

## [5.0.0]

### Added

- Allow row tooltips ([#2483](https://github.com/MetaMask/snaps/pull/2483))
- Support nested children in JSX ([#2482](https://github.com/MetaMask/snaps/pull/2482))

### Changed

- Update `onNameLookup` response types ([#2484](https://github.com/MetaMask/snaps/pull/2484))

### Removed

- **BREAKING:** Remove `parseSvg` and `isSvg` internals ([#2475](https://github.com/MetaMask/snaps/pull/2475))

### Fixed

- Correct Row variant in JSX ([#2486](https://github.com/MetaMask/snaps/pull/2486))
- Revert requiring at least one child in JSX components ([#2481](https://github.com/MetaMask/snaps/pull/2481), [#2470](https://github.com/MetaMask/snaps/pull/2470))
- Correct docs for `Input` and `Dropdown` ([#2479](https://github.com/MetaMask/snaps/pull/2479))

## [4.4.2]

### Fixed

- Require at least 1 child in JSX components ([#2466](https://github.com/MetaMask/snaps/pull/2466))

## [4.4.1]

### Fixed

- Fix invalid `@metamask/snaps-sdk` imports ([#2452](https://github.com/MetaMask/snaps/pull/2452))

## [4.4.0]

### Added

- Add origin to lifecycle hooks ([#2441](https://github.com/MetaMask/snaps/pull/2441))
  - Lifecycle hooks can now use the `origin` parameter to determine the origin
    of the installation or update.

### Changed

- Bump `@metamask/providers` from `16.1.0` to `17.0.0` ([#2442](https://github.com/MetaMask/snaps/pull/2442))
- Bump `@metamask/key-tree` from `9.1.0` to `9.1.1` ([#2431](https://github.com/MetaMask/snaps/pull/2431))

## [4.3.0]

### Added

- Add `Value` component ([#2435](https://github.com/MetaMask/snaps/pull/2435))
- Add `Dropdown` component ([#2420](https://github.com/MetaMask/snaps/pull/2420))
- Add positioning props to `Box` ([#2422](https://github.com/MetaMask/snaps/pull/2422))
- Allow `Button` within `Input` ([#2407](https://github.com/MetaMask/snaps/pull/2407))
- Add `context` field to `snap_createInterface` ([#2413](https://github.com/MetaMask/snaps/pull/2413), [#2427](https://github.com/MetaMask/snaps/pull/2427))

### Fixed

- Correct validation for children of Box component ([#2423](https://github.com/MetaMask/snaps/pull/2423))

## [4.2.0]

### Added

- Add support for BIP-32-Ed25519 / CIP-3 key derivation ([#2408](https://github.com/MetaMask/snaps/pull/2408))

### Fixed

- Add missing TypeScript declarations for JSX entry points ([#2404](https://github.com/MetaMask/snaps/pull/2404))

## [4.1.0]

### Added

- Add JSX support for custom UI ([#2258](https://github.com/MetaMask/snaps/pull/2258), [#2379](https://github.com/MetaMask/snaps/pull/2379))
  - It's now possible to use JSX components from this package to build user
    interfaces for Snaps.
  - This package now exports a custom JSX runtime that can be used to render
    JSX components in Snaps. It can be used with the `react-jsx` and
    `react-jsxdev` JSX pragmas, using `@metamask/snaps-sdk` as import source.
    - When using `@metamask/snaps-cli` to build Snaps, the Snaps JSX runtime
      will be used automatically.

### Changed

- Deprecate legacy UI components ([#2388](https://github.com/MetaMask/snaps/pull/2388))
- Bump `@metamask/providers` from `16.0.0` to `16.1.0` ([#2386](https://github.com/MetaMask/snaps/pull/2386))

## [4.0.1]

### Fixed

- Allow `null` in `FormSubmitEventStruct` form state ([#2333](https://github.com/MetaMask/snaps/pull/2333))

## [4.0.0]

### Removed

- **BREAKING:** Remove broken `ethereum` properties ([#2296](https://github.com/MetaMask/snaps/pull/2296))
  - Snaps can no longer access `on` and `removeListener` on `ethereum`.
  - This feature was already non-functional.

## [3.2.0]

### Added

- Add support for importing SVG, PNG, and JPEG files directly ([#2284](https://github.com/MetaMask/snaps/pull/2284))

### Changed

- Narrow type for `endowment:name-lookup` ([#2293](https://github.com/MetaMask/snaps/pull/2293))
- Bump MetaMask dependencies ([#2270](https://github.com/MetaMask/snaps/pull/2270))

## [3.1.1]

### Changed

- Bump `@metamask/providers` to `^15.0.0` ([#2231](https://github.com/MetaMask/snaps/pull/2231))

### Fixed

- Fix address validation in row component ([#2257](https://github.com/MetaMask/snaps/pull/2257))

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

[Unreleased]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@6.13.0...HEAD
[6.13.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@6.12.0...@metamask/snaps-sdk@6.13.0
[6.12.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@6.11.0...@metamask/snaps-sdk@6.12.0
[6.11.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@6.10.0...@metamask/snaps-sdk@6.11.0
[6.10.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@6.9.0...@metamask/snaps-sdk@6.10.0
[6.9.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@6.8.0...@metamask/snaps-sdk@6.9.0
[6.8.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@6.7.0...@metamask/snaps-sdk@6.8.0
[6.7.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@6.6.0...@metamask/snaps-sdk@6.7.0
[6.6.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@6.5.1...@metamask/snaps-sdk@6.6.0
[6.5.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@6.5.0...@metamask/snaps-sdk@6.5.1
[6.5.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@6.4.0...@metamask/snaps-sdk@6.5.0
[6.4.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@6.3.0...@metamask/snaps-sdk@6.4.0
[6.3.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@6.2.1...@metamask/snaps-sdk@6.3.0
[6.2.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@6.2.0...@metamask/snaps-sdk@6.2.1
[6.2.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@6.1.1...@metamask/snaps-sdk@6.2.0
[6.1.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@6.1.0...@metamask/snaps-sdk@6.1.1
[6.1.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@6.0.0...@metamask/snaps-sdk@6.1.0
[6.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@5.0.0...@metamask/snaps-sdk@6.0.0
[5.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@4.4.2...@metamask/snaps-sdk@5.0.0
[4.4.2]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@4.4.1...@metamask/snaps-sdk@4.4.2
[4.4.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@4.4.0...@metamask/snaps-sdk@4.4.1
[4.4.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@4.3.0...@metamask/snaps-sdk@4.4.0
[4.3.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@4.2.0...@metamask/snaps-sdk@4.3.0
[4.2.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@4.1.0...@metamask/snaps-sdk@4.2.0
[4.1.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@4.0.1...@metamask/snaps-sdk@4.1.0
[4.0.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@4.0.0...@metamask/snaps-sdk@4.0.1
[4.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@3.2.0...@metamask/snaps-sdk@4.0.0
[3.2.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@3.1.1...@metamask/snaps-sdk@3.2.0
[3.1.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@3.1.0...@metamask/snaps-sdk@3.1.1
[3.1.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@3.0.1...@metamask/snaps-sdk@3.1.0
[3.0.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@3.0.0...@metamask/snaps-sdk@3.0.1
[3.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@2.1.0...@metamask/snaps-sdk@3.0.0
[2.1.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@2.0.0...@metamask/snaps-sdk@2.1.0
[2.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@1.4.0...@metamask/snaps-sdk@2.0.0
[1.4.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@1.3.2...@metamask/snaps-sdk@1.4.0
[1.3.2]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@1.3.1...@metamask/snaps-sdk@1.3.2
[1.3.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@1.3.0...@metamask/snaps-sdk@1.3.1
[1.3.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@1.2.0...@metamask/snaps-sdk@1.3.0
[1.2.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@1.1.0...@metamask/snaps-sdk@1.2.0
[1.1.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-sdk@1.0.0...@metamask/snaps-sdk@1.1.0
[1.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/releases/tag/@metamask/snaps-sdk@1.0.0
