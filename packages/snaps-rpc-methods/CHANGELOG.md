# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [12.1.0]

### Uncategorized

- chore(deps): bump @metamask/superstruct from 3.1.0 to 3.2.1 ([#3297](https://github.com/MetaMask/snaps-skunkworks.git/pull/3297))
- feat: Add `onAssetHistoricalPrice` handler ([#3282](https://github.com/MetaMask/snaps-skunkworks.git/pull/3282))
- chore(deps-dev): bump @metamask/auto-changelog from 5.0.0 to 5.0.1 ([#3283](https://github.com/MetaMask/snaps-skunkworks.git/pull/3283))
- chore: Port the ISO 8601 time structs to `snaps-utils` ([#3287](https://github.com/MetaMask/snaps-skunkworks.git/pull/3287))
- chore(deps-dev): bump @metamask/auto-changelog from 4.1.0 to 5.0.0 ([#3277](https://github.com/MetaMask/snaps-skunkworks.git/pull/3277))
- chore(deps): bump @metamask/key-tree from 10.1.0 to 10.1.1 ([#3254](https://github.com/MetaMask/snaps-skunkworks.git/pull/3254))
- Add `AddressInput` component ([#3129](https://github.com/MetaMask/snaps-skunkworks.git/pull/3129))
- feat: Add `AssetSelector` ([#3166](https://github.com/MetaMask/snaps-skunkworks.git/pull/3166))

## [12.0.0]

### Changed

- **BREAKING:** Use mnemonic seed for `snap_get*Entropy` RPC methods ([#3220](https://github.com/MetaMask/snaps/pull/3220))
  - A `getMnemonicSeed` hook is now required to support the RPC methods.
- Use mnemonic seed for state encryption key derivation ([#3217](https://github.com/MetaMask/snaps/pull/3217))

## [11.13.1]

### Fixed

- Unlock client before calling `getEntropySources` in `snap_listEntropySources` method ([#3194](https://github.com/MetaMask/snaps/pull/3194))

## [11.13.0]

### Added

- Implement SIP-30 ([#3156](https://github.com/MetaMask/snaps/pull/3156), [#3165](https://github.com/MetaMask/snaps/pull/3165))
  - This adds a `snap_listEntropySources` method, which returns a list of
    entropy sources.
  - The `snap_get*Entropy` methods now accept an optional `source` parameter to
    specify the entropy source to use.

## [11.12.0]

### Added

- Add additional properties to `snap_getPreferences` ([#3093](https://github.com/MetaMask/snaps/pull/3093))

### Changed

- Bump MetaMask dependencies ([#3091](https://github.com/MetaMask/snaps/pull/3091), [#3082](https://github.com/MetaMask/snaps/pull/3082), [#3050](https://github.com/MetaMask/snaps/pull/3050))

## [11.11.0]

### Added

- Add `endowment:protocol` permission ([#2875](https://github.com/MetaMask/snaps/pull/2875))

## [11.10.0]

### Added

- Add `endowment:assets` permission ([#3028](https://github.com/MetaMask/snaps/pull/3028))

## [11.9.1]

### Fixed

- Validate state size in `snap_setState` method ([#3025](https://github.com/MetaMask/snaps/pull/3025))
- Improve error messages for `snap_manageState` and `snap_setState` methods ([#3025](https://github.com/MetaMask/snaps/pull/3025))

## [11.9.0]

### Added

- Add support for non-recurring cronjobs via `snap_scheduleBackgroundEvent` ([#2941](https://github.com/MetaMask/snaps/pull/2941), [#2975](https://github.com/MetaMask/snaps/pull/2975))
- Add `snap_getState`, `snap_setState`, `snap_clearState` RPC methods ([#2916](https://github.com/MetaMask/snaps/pull/2916))
- Add `hideBalances` to `snap_getPreferences` ([#2978](https://github.com/MetaMask/snaps/pull/2978))

### Changed

- Bump MetaMask dependencies ([#2946](https://github.com/MetaMask/snaps/pull/2946), [#2999](https://github.com/MetaMask/snaps/pull/2999), [#2989](https://github.com/MetaMask/snaps/pull/2989))

## [11.8.0]

### Added

- Add `onSettingsPage` endowment ([#2911](https://github.com/MetaMask/snaps/pull/2911))

## [11.7.0]

### Added

- Add JSX `content` property to `snap_notify` ([#2881](https://github.com/MetaMask/snaps/pull/2881))
  - This content will be displayed in an upcoming expanded view for notifications.
- Add `getClientCryptography` hook for specifying custom cryptography functions ([#2909](https://github.com/MetaMask/snaps/pull/2909))

## [11.6.0]

### Added

- Add `snap_getInterfaceContext` JSON-RPC method ([#2902](https://github.com/MetaMask/snaps/pull/2902))

## [11.5.1]

### Changed

- Bump MetaMask dependencies ([#2853](https://github.com/MetaMask/snaps/pull/2853))

## [11.5.0]

### Removed

- Remove support for JSX in `snap_notify` notifications ([#2837](https://github.com/MetaMask/snaps/pull/2837))
  - This is technically a breaking change, but this feature was never actually
    implemented, so it should not affect any existing code.
  - This will be re-implemented in a future release.

## [11.4.0]

### Added

- Add `snap_experimentalProviderRequest` JSON-RPC method ([#2773](https://github.com/MetaMask/snaps/pull/2773))
  - This method is experimental and will likely be removed in a future release.

### Changed

- Allow updating interface context ([#2809](https://github.com/MetaMask/snaps/pull/2809))
  - `snap_updateInterface` now accepts a `context` parameter to update the
    context of an interface.

### Fixed

- Use `BigInt` to parse chain IDs ([#2781](https://github.com/MetaMask/snaps/pull/2781))

## [11.3.0]

### Added

- Add `snap_getCurrencyRate` JSON-RPC method ([#2763](https://github.com/MetaMask/snaps/pull/2763))

## [11.2.0]

### Added

- Add support for `metamask:` schemed URLs ([#2719](https://github.com/MetaMask/snaps/pull/2719))
- Add support for JSX in `snap_notify` notifications ([#2706](https://github.com/MetaMask/snaps/pull/2706))

## [11.1.1]

### Fixed

- Fix invalid types in type declaration in some cases ([#2714](https://github.com/MetaMask/snaps/pull/2714))

## [11.1.0]

### Changed

- Improve error messaging ([#2696](https://github.com/MetaMask/snaps/pull/2696))
- Increase character limit for in-app notification messages ([#2684](https://github.com/MetaMask/snaps/pull/2684))

### Fixed

- Fix ESM version of the package ([#2682](https://github.com/MetaMask/snaps/pull/2682))
  - This fixes the ESM version of the package to be fully compliant with the ESM
    standard.
- Bump `@metamask/utils` from `^9.1.0` to `^9.2.1` ([#2680](https://github.com/MetaMask/snaps/pull/2680))
- Bump other MetaMask dependencies ([#2703](https://github.com/MetaMask/snaps/pull/2703))

## [11.0.0]

### Added

- **BREAKING:** Add `snap_getPreferences` ([#2607](https://github.com/MetaMask/snaps/pull/2607))
  - This is breaking because a `getPreferences` method hook is now required.

## [10.0.1]

### Changed

- Bump `@metamask/json-rpc-engine` from `^9.0.0` to `^9.0.2` ([#2593](https://github.com/metamask/snaps/pull/2593))
- Bump `@metamask/permission-controller` from `^10.0.1` to `^11.0.0` ([#2593](https://github.com/metamask/snaps/pull/2593))
- Bump `@metamask/snaps-utils` from `^7.8.0` to `^7.8.1` ([#2595](https://github.com/MetaMask/snaps/pull/2595))

## [10.0.0]

### Added

- **BREAKING:** `snap_dialog` now takes the `requestUserApproval` hook ([#2509](https://github.com/metamask/snaps/pull/2509))
  - It should bind to the `addAndShowRequest` method of the `ApprovalController`.
  - Add type `DialogApprovalTypes` and object `DIALOG_APPROVAL_TYPES`.

### Changed

- Bump `@metamask/key-tree` from `^9.1.1` to `^9.1.2` ([#2445](https://github.com/MetaMask/snaps/pull/2445))
- Bump `@metamask/permission-controller` from `^10.0.0` to `^10.0.1` ([#2445](https://github.com/MetaMask/snaps/pull/2445))
- Bump `@metamask/rpc-errors` from `^6.2.1` to `^6.3.1` ([#2445](https://github.com/MetaMask/snaps/pull/2445))
- Bump `@metamask/utils` from `^8.3.0` to `^9.1.0` ([#2445](https://github.com/MetaMask/snaps/pull/2445))

### Fixed

- Replace `superstruct` with ESM-compatible `@metamask/superstruct` `^3.1.0` ([#2445](https://github.com/MetaMask/snaps/pull/2445))
  - This fixes the issue of this package being unusable by any TypeScript project that uses `Node16` or `NodeNext` as its `moduleResolution` option.

## [9.1.4]

### Changed

- Bump MetaMask dependencies ([#2516](https://github.com/MetaMask/snaps/pull/2516))

## [9.1.3]

### Changed

- Bump MetaMask dependencies ([#2460](https://github.com/MetaMask/snaps/pull/2460))

## [9.1.2]

### Fixed

- Fix invalid `@metamask/snaps-sdk` imports ([#2452](https://github.com/MetaMask/snaps/pull/2452))

## [9.1.1]

### Changed

- Bump `@metamask/key-tree` from `9.1.0` to `9.1.1` ([#2431](https://github.com/MetaMask/snaps/pull/2431))

## [9.1.0]

### Added

- Add `context` field to `snap_createInterface` ([#2413](https://github.com/MetaMask/snaps/pull/2413))

## [9.0.0]

### Added

- Add support for BIP-32-Ed25519 / CIP-3 key derivation ([#2408](https://github.com/MetaMask/snaps/pull/2408))
  - The `ed25519Bip32` curve is now supported for `snap_getBip32Entropy` and `snap_getBip32PublicKey`

### Changed

- **BREAKING:** Use hooks in `wallet_invokeSnap` instead of remapping the request to `wallet_snap` ([#2406](https://github.com/MetaMask/snaps/pull/2406))

## [8.1.0]

### Added

- Add JSX support for custom UI ([#2258](https://github.com/MetaMask/snaps/pull/2258))

## [8.0.0]

### Changed

- **BREAKING:** Refactor to support changes to encryption ([#2316](https://github.com/MetaMask/snaps/pull/2316))
  - No longer expects `encrypt` or `decrypt`, instead expects `updateSnapState` and `getSnapState` to be asynchronous

## [7.0.2]

### Changed

- Bump MetaMask dependencies ([#2270](https://github.com/MetaMask/snaps/pull/2270))
- Bump @metamask/json-rpc-engine from 7.3.2 to 7.3.3 ([#2247](https://github.com/MetaMask/snaps/pull/2247))

## [7.0.1]

### Fixed

- Fix minor build configuration problems ([#2220](https://github.com/MetaMask/snaps/pull/2220))

## [7.0.0]

### Changed

- **BREAKING:** Update ESM build to be fully compliant with the ESM standard ([#2210](https://github.com/MetaMask/snaps/pull/2210))
- Bump `@metamask/rpc-errors` to `^6.2.1` ([#2209](https://github.com/MetaMask/snaps/pull/2209))

## [6.0.0]

### Added

- **BREAKING:** Add support for dynamic user interfaces ([#1465](https://github.com/MetaMask/snaps/pull/1465), [#2144](https://github.com/MetaMask/snaps/pull/2144), [#2143](https://github.com/MetaMask/snaps/pull/2143))
  - This adds the `snap_createInterface`, `snap_updateInterface`, and `snap_getInterfaceState` methods.
  - This is breaking because it changes the expected type of the `showDialog` RPC method hook.
- **BREAKING:** Update the permission format for the name lookup endowment ([#2113](https://github.com/MetaMask/snaps/pull/2113))
  - The new format is documented in [SIP-12](https://metamask.github.io/SIPs/SIPS/sip-12).
- Add endowment permission specifications to this package ([#2155](https://github.com/MetaMask/snaps/pull/2155))

### Changed

- Bump MetaMask dependencies ([#2129](https://github.com/MetaMask/snaps/pull/2129), [#2142](https://github.com/MetaMask/snaps/pull/2142))

## [5.0.0]

### Added

- Add `snap_getClientStatus` ([#2051](https://github.com/MetaMask/snaps/pull/2051))

### Changed

- **BREAKING:** Use origin bound hooks for `invokeKeyring` ([#2090](https://github.com/MetaMask/snaps/pull/2090))
- Bump several MetaMask dependencies ([#2069](https://github.com/MetaMask/snaps/pull/2069), [#2100](https://github.com/MetaMask/snaps/pull/2100))

## [4.1.0]

### Added

- Add `wallet_getAllSnaps` method to get all installed Snaps ([#2047](https://github.com/MetaMask/snaps/pull/2047))

### Changed

- Bump several MetaMask dependencies ([#2064](https://github.com/MetaMask/snaps/pull/2064), [#2065](https://github.com/MetaMask/snaps/pull/2065))

## [4.0.3]

### Changed

- Use prototype `startsWith` for RPC method middleware ([#2035](https://github.com/MetaMask/snaps/pull/2035))

## [4.0.2]

### Changed

- Bump several MetaMask dependencies ([#1989](https://github.com/MetaMask/snaps/pull/1989))

## [4.0.1]

### Changed

- Bump several MetaMask dependencies ([#1964](https://github.com/MetaMask/snaps/pull/1964), [#1968](https://github.com/MetaMask/snaps/pull/1968))

## [4.0.0]

### Changed

- Use `@metamask/snaps-sdk` package ([#1930](https://github.com/MetaMask/snaps/pull/1930),
  [#1950](https://github.com/MetaMask/snaps/pull/1950), [#1954](https://github.com/MetaMask/snaps/pull/1954))
  - This package replaces the `@metamask/snaps-types` and
  - `@metamask/snaps-ui` packages.

### Removed

- **BREAKING**: Remove `DialogType`, `ManageStateOperation`, and `NotificationType` enums ([#1930](https://github.com/MetaMask/snaps/pull/1930))
  - These are now defined in the `@metamask/snaps-sdk` package.

## [3.3.0]

### Added

- Add support for unencrypted storage using `snap_manageState` ([#1902](https://github.com/MetaMask/snaps/pull/1902))

## [3.2.1]

### Fixed

- Fix `assertLinksAreSafe` import ([#1908](https://github.com/MetaMask/snaps/pull/1908))

## [3.2.0]

### Added

- Add support for links in custom UI and notifications ([#1814](https://github.com/MetaMask/snaps/pull/1814))

## [3.1.0]

### Changed

- Rename package to `@metamask/snaps-rpc-methods` ([#1864](https://github.com/MetaMask/snaps/pull/1864))
- Update multiple MetaMask dependencies ([#1841](https://github.com/MetaMask/snaps/pull/1841))

## [3.0.0]

### Added

- Add keyring export and endowment ([#1787](https://github.com/MetaMask/snaps/pull/1787))

### Changed

- **BREAKING:** Bump minimum Node.js version to `^18.16.0` ([#1741](https://github.com/MetaMask/snaps/pull/1741))

## [2.0.0]

### Changed

- Initial stable release from main branch ([#1757](https://github.com/MetaMask/snaps/pull/1757))

## [0.38.3-flask.1]

### Changed

- Bump `metamask/utils` and `metamask/snaps-registry` ([#1738](https://github.com/MetaMask/snaps/pull/1738))

## [0.38.2-flask.1]

### Changed

- Remove business-logic callbacks from `manageAccounts` ([#1725](https://github.com/MetaMask/snaps/pull/1725))
- Bump `@metamask/utils` and `@metamask/snaps-registry` ([#1694](https://github.com/MetaMask/snaps/pull/1694))

## [0.38.1-flask.1]

### Fixed

- Make `manageAccounts` arguments extend `RestrictedMethodParameters` ([#1687](https://github.com/MetaMask/snaps/pull/1687))

## [0.38.0-flask.1]

### Added

- Add `snap_getLocale` JSON-RPC method ([#1557](https://github.com/MetaMask/snaps/pull/1557))
  - This will let snaps get the user locale from the client.

### Fixed

- Fix ed25519 public key derivation ([#1678](https://github.com/MetaMask/snaps/pull/1678))

## [0.37.2-flask.1]

### Changed

- Release package independently ([#1600](https://github.com/MetaMask/snaps/pull/1600))
  - The version of the package no longer needs to match the version of all other
    MetaMask Snaps packages.

[Unreleased]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@12.1.0...HEAD
[12.1.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@12.0.0...@metamask/snaps-rpc-methods@12.1.0
[12.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@11.13.1...@metamask/snaps-rpc-methods@12.0.0
[11.13.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@11.13.0...@metamask/snaps-rpc-methods@11.13.1
[11.13.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@11.12.0...@metamask/snaps-rpc-methods@11.13.0
[11.12.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@11.11.0...@metamask/snaps-rpc-methods@11.12.0
[11.11.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@11.10.0...@metamask/snaps-rpc-methods@11.11.0
[11.10.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@11.9.1...@metamask/snaps-rpc-methods@11.10.0
[11.9.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@11.9.0...@metamask/snaps-rpc-methods@11.9.1
[11.9.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@11.8.0...@metamask/snaps-rpc-methods@11.9.0
[11.8.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@11.7.0...@metamask/snaps-rpc-methods@11.8.0
[11.7.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@11.6.0...@metamask/snaps-rpc-methods@11.7.0
[11.6.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@11.5.1...@metamask/snaps-rpc-methods@11.6.0
[11.5.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@11.5.0...@metamask/snaps-rpc-methods@11.5.1
[11.5.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@11.4.0...@metamask/snaps-rpc-methods@11.5.0
[11.4.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@11.3.0...@metamask/snaps-rpc-methods@11.4.0
[11.3.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@11.2.0...@metamask/snaps-rpc-methods@11.3.0
[11.2.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@11.1.1...@metamask/snaps-rpc-methods@11.2.0
[11.1.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@11.1.0...@metamask/snaps-rpc-methods@11.1.1
[11.1.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@11.0.0...@metamask/snaps-rpc-methods@11.1.0
[11.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@10.0.1...@metamask/snaps-rpc-methods@11.0.0
[10.0.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@10.0.0...@metamask/snaps-rpc-methods@10.0.1
[10.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@9.1.4...@metamask/snaps-rpc-methods@10.0.0
[9.1.4]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@9.1.3...@metamask/snaps-rpc-methods@9.1.4
[9.1.3]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@9.1.2...@metamask/snaps-rpc-methods@9.1.3
[9.1.2]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@9.1.1...@metamask/snaps-rpc-methods@9.1.2
[9.1.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@9.1.0...@metamask/snaps-rpc-methods@9.1.1
[9.1.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@9.0.0...@metamask/snaps-rpc-methods@9.1.0
[9.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@8.1.0...@metamask/snaps-rpc-methods@9.0.0
[8.1.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@8.0.0...@metamask/snaps-rpc-methods@8.1.0
[8.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@7.0.2...@metamask/snaps-rpc-methods@8.0.0
[7.0.2]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@7.0.1...@metamask/snaps-rpc-methods@7.0.2
[7.0.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@7.0.0...@metamask/snaps-rpc-methods@7.0.1
[7.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@6.0.0...@metamask/snaps-rpc-methods@7.0.0
[6.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@5.0.0...@metamask/snaps-rpc-methods@6.0.0
[5.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@4.1.0...@metamask/snaps-rpc-methods@5.0.0
[4.1.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@4.0.3...@metamask/snaps-rpc-methods@4.1.0
[4.0.3]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@4.0.2...@metamask/snaps-rpc-methods@4.0.3
[4.0.2]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@4.0.1...@metamask/snaps-rpc-methods@4.0.2
[4.0.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@4.0.0...@metamask/snaps-rpc-methods@4.0.1
[4.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@3.3.0...@metamask/snaps-rpc-methods@4.0.0
[3.3.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@3.2.1...@metamask/snaps-rpc-methods@3.3.0
[3.2.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@3.2.0...@metamask/snaps-rpc-methods@3.2.1
[3.2.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@3.1.0...@metamask/snaps-rpc-methods@3.2.0
[3.1.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@3.0.0...@metamask/snaps-rpc-methods@3.1.0
[3.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@2.0.0...@metamask/snaps-rpc-methods@3.0.0
[2.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@0.38.3-flask.1...@metamask/snaps-rpc-methods@2.0.0
[0.38.3-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@0.38.2-flask.1...@metamask/snaps-rpc-methods@0.38.3-flask.1
[0.38.2-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@0.38.1-flask.1...@metamask/snaps-rpc-methods@0.38.2-flask.1
[0.38.1-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@0.38.0-flask.1...@metamask/snaps-rpc-methods@0.38.1-flask.1
[0.38.0-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rpc-methods@0.37.2-flask.1...@metamask/snaps-rpc-methods@0.38.0-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/releases/tag/@metamask/snaps-rpc-methods@0.37.2-flask.1
