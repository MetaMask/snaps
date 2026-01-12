# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.8.0]

### Uncategorized

- chore: Bump @metamask/permission-controller from 12.1.1 to 12.2.0 ([#3791](https://github.com/MetaMask/snaps/pull/3791))
- chore: Bump @lavamoat/allow-scripts from 3.4.0 to 3.4.1 ([#3744](https://github.com/MetaMask/snaps/pull/3744))
- feat: Support more chains when simulating Ethereum provider ([#3789](https://github.com/MetaMask/snaps/pull/3789))
- chore: Bump @metamask/utils from 11.8.1 to 11.9.0 ([#3783](https://github.com/MetaMask/snaps/pull/3783))
- chore: Bump @metamask/phishing-controller from 15.0.0 to 16.1.0 ([#3748](https://github.com/MetaMask/snaps/pull/3748))

## [3.7.0]

### Added

- Add support for external images ([#3769](https://github.com/MetaMask/snaps/pull/3769))

## [3.6.0]

### Added

- Add support for the `DateTimePicker` component ([#3698](https://github.com/MetaMask/snaps/pull/3698))
  - The `pickDateTime` function can be used to interact with the component in tests.
- Include client versions in `snap_getClientStatus` ([#3724](https://github.com/MetaMask/snaps/pull/3724))

## Changed

- Bump `@metamask/permission-controller` from `12.0.0` to `12.1.1` ([#3746](https://github.com/MetaMask/snaps/pull/3746)), ([#3714](https://github.com/MetaMask/snaps/pull/3714))
- Bump `@metamask/phishing-controller` from `13.1.0` to `15.0.0` ([#3707](https://github.com/MetaMask/snaps/pull/3707))

## [3.5.1]

### Changed

- Bump `@metamask/permission-controller` from `^11.0.6` to `^12.0.0`(([#3611](https://github.com/MetaMask/snaps/pull/3611))

### Removed

- Remove `@metamask/base-controller` dependency ([#3611](https://github.com/MetaMask/snaps/pull/3611))

## [3.5.0]

### Added

- Allow mocking JSON-RPC implementations ([#3667](https://github.com/MetaMask/snaps/pull/3667))

## [3.4.2]

### Changed

- Adjust hooks after changes in RPC method imlementations ([#3361](https://github.com/MetaMask/snaps/pull/3361), [#3660](https://github.com/MetaMask/snaps/pull/3660))
- Bump MetaMask dependencies ([#3651](https://github.com/MetaMask/snaps/pull/3651), [#3638](https://github.com/MetaMask/snaps/pull/3638), [#3648](https://github.com/MetaMask/snaps/pull/3648), [#3630](https://github.com/MetaMask/snaps/pull/3630), [#3628](https://github.com/MetaMask/snaps/pull/3628), [#3629](https://github.com/MetaMask/snaps/pull/3629), [#3607](https://github.com/MetaMask/snaps/pull/3607), [#3623](https://github.com/MetaMask/snaps/pull/3623), [#3612](https://github.com/MetaMask/snaps/pull/3612))

## [3.4.1]

### Fixed

- Ignore "Premature close" stream messages ([#3074](https://github.com/MetaMask/snaps/pull/3074))

## [3.4.0]

### Added

- Add support for `snap_startTrace` and `snap_endTrace` ([#3547](https://github.com/MetaMask/snaps/pull/3547))
- Add support for `snap_trackError` ([#3546](https://github.com/MetaMask/snaps/pull/3546))
- Add support for `snap_trackEvent` ([#3546](https://github.com/MetaMask/snaps/pull/3546))

## [3.3.0]

### Added

- Add Snap metadata to simulated accounts ([#3528](https://github.com/MetaMask/snaps/pull/3528))

## [3.2.0]

### Added

- Add support for `AssetSelector` and `AccountSelector` ([#3462](https://github.com/MetaMask/snaps/pull/3462))

## [3.1.0]

### Added

- Add support for `onStart` ([#3455](https://github.com/MetaMask/snaps/pull/3455))

## [3.0.0]

### Added

- Add support for `onClientRequest` ([#3445](https://github.com/MetaMask/snaps/pull/3445))

### Changed

- **BREAKING:** Drop support for Node.js 18 and 21 ([#3447](https://github.com/MetaMask/snaps/pull/3447))
- Bump `@metamask/eth-json-rpc-middleware` from `17.0.0` to `17.0.1` ([#3427](https://github.com/MetaMask/snaps/pull/3427))

## [2.7.0]

### Added

- Add `active` flag for `snap_getClientStatus` ([#3424](https://github.com/MetaMask/snaps/pull/3424))
- Add support for `onProtocolRequest` ([#3422](https://github.com/MetaMask/snaps/pull/3422))

## [2.6.0]

### Added

- Add support for `wallet_switchEthereumChain` ([#2634](https://github.com/MetaMask/snaps/pull/2634))
- Add `showTestnets` to `snap_getPreferences` ([#3395](https://github.com/MetaMask/snaps/pull/3395))

## [2.5.0]

### Added

- Add support for `AddressInput` ([#3312](https://github.com/MetaMask/snaps/pull/3312))

## [2.4.1]

### Fixed

- Pass proper origin to handlers ([#3292](https://github.com/MetaMask/snaps/pull/3292))

## [2.4.0]

### Added

- Add support for `getMnemonicSeed` hook required by latest RPC methods ([#3220](https://github.com/MetaMask/snaps/pull/3220))

### Changed

- Bump `express` to `^4.21.2` ([#3196](https://github.com/MetaMask/snaps/pull/3196))

## [2.3.0]

### Added

- Add support for SIP-30 ([#3156](https://github.com/MetaMask/snaps/pull/3156), [#3165](https://github.com/MetaMask/snaps/pull/3165))
- Add the interface ID to the return value of `getInterface` ([#3174](https://github.com/MetaMask/snaps/pull/3174))

### Changed

- Bump `@metamask/phishing-controller` from `12.3.2` to `12.4.0` ([#3171](https://github.com/MetaMask/snaps/pull/3171))
- Bump `@metamask/eth-json-rpc-middleware` from `15.2.0` to `15.3.0` ([#3148](https://github.com/MetaMask/snaps/pull/3148))

### Fixed

- Fix `onKeyringRequest` not matching the implementation type ([#3138](https://github.com/MetaMask/snaps/pull/3138))

## [2.2.0]

### Added

- Add additional properties to `snap_getPreferences` ([#3093](https://github.com/MetaMask/snaps/pull/3093))

### Changed

- Bump MetaMask dependencies ([#3091](https://github.com/MetaMask/snaps/pull/3091), [#3092](https://github.com/MetaMask/snaps/pull/3092), [#3084](https://github.com/MetaMask/snaps/pull/3084), [#3083](https://github.com/MetaMask/snaps/pull/3083), [#3082](https://github.com/MetaMask/snaps/pull/3082), [#3050](https://github.com/MetaMask/snaps/pull/3050))

### Fixed

- Improve unintentionally narrow type for `onKeyringRequest` helper ([#3109](https://github.com/MetaMask/snaps/pull/3109))

## [2.1.0]

### Added

- Mock `eth_chainId` and `net_version` calls automatically ([#3017](https://github.com/MetaMask/snaps/pull/3017))

## [2.0.0]

### Added

- **BREAKING:** Add support for new state methods to `snaps-simulation` ([#2966](https://github.com/MetaMask/snaps/pull/2966))
  - The `MiddlewareHooks` type was removed.
- Add `hideBalances` to `snap_getPreferences` ([#2978](https://github.com/MetaMask/snaps/pull/2978))
- Allow unit testing of expanded-view notifications ([#2956](https://github.com/MetaMask/snaps/pull/2956))
- Add `onBackgroundEvent` alias ([#2974](https://github.com/MetaMask/snaps/pull/2974))

### Changed

- Bump MetaMask dependencies ([#2946](https://github.com/MetaMask/snaps/pull/2946), [#2991](https://github.com/MetaMask/snaps/pull/2991), [#2999](https://github.com/MetaMask/snaps/pull/2999))

## [1.5.0]

### Added

- Add `waitForUpdate` interface action ([#2960](https://github.com/MetaMask/snaps/pull/2960))
- Add support for `onSettingsPage` export ([#2911](https://github.com/MetaMask/snaps/pull/2911))

## [1.4.1]

### Changed

- Bump `@metamask/key-tree` from `^9.1.2` to `^10.0.1` ([#2909](https://github.com/MetaMask/snaps/pull/2909))

## [1.4.0]

### Added

- Add `snap_getInterfaceContext` JSON-RPC method ([#2902](https://github.com/MetaMask/snaps/pull/2902))

## [1.3.1]

### Added

- Add interface persistence ([#2856](https://github.com/MetaMask/snaps/pull/2856))

## [1.3.0]

### Added

- Add function to test `onNameLookup` ([#2857](https://github.com/MetaMask/snaps/pull/2857))
- Add function to test `onInstall` and `onUpdate` ([#2849](https://github.com/MetaMask/snaps/pull/2849))

### Changed

- Bump MetaMask dependencies ([#2853](https://github.com/MetaMask/snaps/pull/2853))

## [1.2.0]

### Added

- Add support for button `form` property ([#2830](https://github.com/MetaMask/snaps/pull/2830))
- Add function to test `onKeyringRequest` ([#2777](https://github.com/MetaMask/snaps/pull/2777))
  - The `onKeyringRequest` function can be used to test keyring requests.

## [1.1.1]

### Removed

- Remove `eth_sign` ([#2772](https://github.com/MetaMask/snaps/pull/2772))
  - This method was removed from the MetaMask extension, so any references to it
    in Snaps can be removed.

### Fixed

- Add missing dependency on `@metamask/snaps-execution-environments` ([#2791](https://github.com/MetaMask/snaps/pull/2791))

## [1.1.0]

### Changed

- Move helper functions to simulation package ([#2769](https://github.com/MetaMask/snaps/pull/2769))

## [1.0.1]

### Fixed

- Fix invalid `exports` field ([#2740](https://github.com/MetaMask/snaps/pull/2740))

## [1.0.0]

### Added

- Initial release of `@metamask/snaps-simulation` package ([#2727](https://github.com/MetaMask/snaps/pull/2727))

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@3.8.0...HEAD
[3.8.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@3.7.0...@metamask/snaps-simulation@3.8.0
[3.7.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@3.6.0...@metamask/snaps-simulation@3.7.0
[3.6.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@3.5.1...@metamask/snaps-simulation@3.6.0
[3.5.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@3.5.0...@metamask/snaps-simulation@3.5.1
[3.5.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@3.4.2...@metamask/snaps-simulation@3.5.0
[3.4.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@3.4.1...@metamask/snaps-simulation@3.4.2
[3.4.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@3.4.0...@metamask/snaps-simulation@3.4.1
[3.4.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@3.3.0...@metamask/snaps-simulation@3.4.0
[3.3.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@3.2.0...@metamask/snaps-simulation@3.3.0
[3.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@3.1.0...@metamask/snaps-simulation@3.2.0
[3.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@3.0.0...@metamask/snaps-simulation@3.1.0
[3.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@2.7.0...@metamask/snaps-simulation@3.0.0
[2.7.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@2.6.0...@metamask/snaps-simulation@2.7.0
[2.6.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@2.5.0...@metamask/snaps-simulation@2.6.0
[2.5.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@2.4.1...@metamask/snaps-simulation@2.5.0
[2.4.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@2.4.0...@metamask/snaps-simulation@2.4.1
[2.4.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@2.3.0...@metamask/snaps-simulation@2.4.0
[2.3.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@2.2.0...@metamask/snaps-simulation@2.3.0
[2.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@2.1.0...@metamask/snaps-simulation@2.2.0
[2.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@2.0.0...@metamask/snaps-simulation@2.1.0
[2.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@1.5.0...@metamask/snaps-simulation@2.0.0
[1.5.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@1.4.1...@metamask/snaps-simulation@1.5.0
[1.4.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@1.4.0...@metamask/snaps-simulation@1.4.1
[1.4.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@1.3.1...@metamask/snaps-simulation@1.4.0
[1.3.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@1.3.0...@metamask/snaps-simulation@1.3.1
[1.3.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@1.2.0...@metamask/snaps-simulation@1.3.0
[1.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@1.1.1...@metamask/snaps-simulation@1.2.0
[1.1.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@1.1.0...@metamask/snaps-simulation@1.1.1
[1.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@1.0.1...@metamask/snaps-simulation@1.1.0
[1.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@1.0.0...@metamask/snaps-simulation@1.0.1
[1.0.0]: https://github.com/MetaMask/snaps/releases/tag/@metamask/snaps-simulation@1.0.0
