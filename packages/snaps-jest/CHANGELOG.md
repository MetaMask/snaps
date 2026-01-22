# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Uncategorized

- chore: Bump @lavamoat/allow-scripts from 3.4.1 to 3.4.2 ([#3809](https://github.com/MetaMask/snaps/pull/3809))

## [9.8.0]

### Added

- Support more chains when simulating Ethereum provider ([#3789](https://github.com/MetaMask/snaps/pull/3789))

### Changed

- Bump MetaMask dependencies ([#3783](https://github.com/MetaMask/snaps/pull/3783), [#3748](https://github.com/MetaMask/snaps/pull/3748))

## [9.7.0]

### Added

- Add support for external images ([#3769](https://github.com/MetaMask/snaps/pull/3769))

## [9.6.0]

### Added

- Add support for the `DateTimePicker` component ([#3698](https://github.com/MetaMask/snaps/pull/3698))
  - The `pickDateTime` function can be used to interact with the component in tests.

### Changed

- Bump `@metamask/phishing-controller` from `13.1.0` to `15.0.0` ([#3707](https://github.com/MetaMask/snaps/pull/3707))

## [9.5.1]

### Changed

- Bump `@metamask/permission-controller` from `^11.0.6` to `^12.0.0`(([#3611](https://github.com/MetaMask/snaps/pull/3611))

### Removed

- Remove `@metamask/base-controller` dependency ([#3611](https://github.com/MetaMask/snaps/pull/3611))

## [9.5.0]

### Added

- Allow mocking JSON-RPC implementations ([#3667](https://github.com/MetaMask/snaps/pull/3667))

## [9.4.1]

### Changed

- Bump MetaMask dependencies ([#3651](https://github.com/MetaMask/snaps/pull/3651), [#3638](https://github.com/MetaMask/snaps/pull/3638), [#3648](https://github.com/MetaMask/snaps/pull/3648), [#3630](https://github.com/MetaMask/snaps/pull/3630), [#3628](https://github.com/MetaMask/snaps/pull/3628), [#3629](https://github.com/MetaMask/snaps/pull/3629), [#3607](https://github.com/MetaMask/snaps/pull/3607), [#3623](https://github.com/MetaMask/snaps/pull/3623), [#3612](https://github.com/MetaMask/snaps/pull/3612))

## [9.4.0]

### Added

- Add support for `snap_startTrace` and `snap_endTrace` ([#3547](https://github.com/MetaMask/snaps/pull/3547))
- Add support for `snap_trackError` ([#3546](https://github.com/MetaMask/snaps/pull/3546))
- Add support for `snap_trackEvent` ([#3546](https://github.com/MetaMask/snaps/pull/3546))

## [9.3.0]

### Added

- Add Snap metadata to simulated accounts ([#3528](https://github.com/MetaMask/snaps/pull/3528))

## [9.2.0]

### Added

- Add support for `AssetSelector` and `AccountSelector` ([#3462](https://github.com/MetaMask/snaps/pull/3462))

## [9.1.0]

### Added

- Add support for `onStart` ([#3455](https://github.com/MetaMask/snaps/pull/3455))

## [9.0.0]

### Added

- Add support for `onClientRequest` ([#3445](https://github.com/MetaMask/snaps/pull/3445))

### Changed

- **BREAKING:** Drop support for Node.js 18 and 21 ([#3447](https://github.com/MetaMask/snaps/pull/3447))

## [8.16.0]

### Added

- Add support for `onProtocolRequest` ([#3422](https://github.com/MetaMask/snaps/pull/3422))

## [8.15.0]

### Added

- Add support for `wallet_switchEthereumChain` ([#2634](https://github.com/MetaMask/snaps/pull/2634))

## [8.14.1]

### Fixed

- Pass proper origin to handlers ([#3292](https://github.com/MetaMask/snaps/pull/3292))

## [8.14.0]

### Added

- Add support for `getMnemonicSeed` hook required by latest RPC methods ([#3220](https://github.com/MetaMask/snaps/pull/3220))

### Changed

- Bump `express` to `^4.21.2` ([#3196](https://github.com/MetaMask/snaps/pull/3196))

## [8.13.0]

### Added

- Add support for SIP-30 ([#3156](https://github.com/MetaMask/snaps/pull/3156), [#3165](https://github.com/MetaMask/snaps/pull/3165))
- Add the interface ID to the return value of `getInterface` ([#3174](https://github.com/MetaMask/snaps/pull/3174))

## [8.12.0]

### Changed

- Bump MetaMask dependencies ([#3050](https://github.com/MetaMask/snaps/pull/3050), [#3091](https://github.com/MetaMask/snaps/pull/3091))

### Fixed

- Fix unintentionally narrow type for `onKeyringRequest` helper ([#3109](https://github.com/MetaMask/snaps/pull/3109))

## [8.11.0]

### Added

- Mock `eth_chainId` and `net_version` calls automatically ([#3017](https://github.com/MetaMask/snaps/pull/3017))

## [8.10.0]

### Added

- Allow unit testing of expanded-view notifications ([#2956](https://github.com/MetaMask/snaps/pull/2956))
- Add `onBackgroundEvent` alias ([#2974](https://github.com/MetaMask/snaps/pull/2974))

### Changed

- Bump MetaMask dependencies ([#2946](https://github.com/MetaMask/snaps/pull/2946))

## [8.9.0]

### Added

- Add `waitForUpdate` interface action ([#2960](https://github.com/MetaMask/snaps/pull/2960))
- Add support for `onSettingsPage` export ([#2911](https://github.com/MetaMask/snaps/pull/2911))

## [8.8.1]

### Changed

- Bump `@metamask/key-tree` from `^9.1.2` to `^10.0.1` ([#2909](https://github.com/MetaMask/snaps/pull/2909))

## [8.8.0]

### Added

- Add `snap_getInterfaceContext` JSON-RPC method ([#2902](https://github.com/MetaMask/snaps/pull/2902))

## [8.7.1]

### Added

- Add interface persistence ([#2856](https://github.com/MetaMask/snaps/pull/2856))

## [8.7.0]

### Added

- Add function to test `onNameLookup` ([#2857](https://github.com/MetaMask/snaps/pull/2857))
- Add function to test `onInstall` and `onUpdate` ([#2849](https://github.com/MetaMask/snaps/pull/2849))

### Changed

- Bump MetaMask dependencies ([#2853](https://github.com/MetaMask/snaps/pull/2853))

## [8.6.0]

### Added

- Add function to test `onKeyringRequest` ([#2777](https://github.com/MetaMask/snaps/pull/2777))
  - The `onKeyringRequest` function can be used to test keyring requests.

## [8.5.0]

### Changed

- Move helper functions to simulation package ([#2769](https://github.com/MetaMask/snaps/pull/2769))

## [8.4.0]

### Added

- Add support for selector component ([#2724](https://github.com/MetaMask/snaps/pull/2724))
  - Interfaces now have a `selectFromSelector` function that can be used to
    select an option from a selector.

### Changed

- Extract simulation part of `snaps-jest` to separate package ([#2727](https://github.com/MetaMask/snaps/pull/2727))

## [8.3.2]

### Fixed

- Fix invalid types in type declaration in some cases ([#2714](https://github.com/MetaMask/snaps/pull/2714))

## [8.3.1]

### Fixed

- Fix ESM version of the package ([#2682](https://github.com/MetaMask/snaps/pull/2682))
  - This fixes the ESM version of the package to be fully compliant with the ESM
    standard.
- Bump `@metamask/utils` from `^9.1.0` to `^9.2.1` ([#2680](https://github.com/MetaMask/snaps/pull/2680))
- Bump other MetaMask dependencies ([#2703](https://github.com/MetaMask/snaps/pull/2703))

## [8.3.0]

### Added

- Add support for `snap_getPreferences` ([#2607](https://github.com/MetaMask/snaps/pull/2607))
- Add `RadioGroup` component ([#2592](https://github.com/MetaMask/snaps/pull/2592))
- Add support for custom dialogs in `snaps-jest` ([#2526](https://github.com/MetaMask/snaps/pull/2526), [#2509](https://github.com/MetaMask/snaps/pull/2509))

### Changed

- Replace `superstruct` with ESM-compatible fork `@metamask/superstruct` ([#2445](https://github.com/MetaMask/snaps/pull/2445))

## [8.2.0]

### Added

- Add support for `Checkbox` to `snaps-jest` ([#2515](https://github.com/MetaMask/snaps/pull/2515))
  - Checkboxes can be interacted with using `clickElement`.
- Add support for `FileInput` to `snaps-jest` ([#2494](https://github.com/MetaMask/snaps/pull/2494))
  - Files can be uploaded to file inputs using `uploadFile`.

## [8.1.3]

### Changed

- Bump MetaMask dependencies ([#2460](https://github.com/MetaMask/snaps/pull/2460), [#2477](https://github.com/MetaMask/snaps/pull/2477))

## [8.1.2]

### Fixed

- Fix invalid `@metamask/snaps-sdk` imports ([#2452](https://github.com/MetaMask/snaps/pull/2452))

## [8.1.1]

### Changed

- Bump `@metamask/key-tree` from `9.1.0` to `9.1.1` ([#2431](https://github.com/MetaMask/snaps/pull/2431))

## [8.1.0]

### Added

- Add `selectInDropdown` to be used with the newly added `Dropdown` component ([#2420](https://github.com/MetaMask/snaps/pull/2420))
- Add `context` field to `snap_createInterface` ([#2413](https://github.com/MetaMask/snaps/pull/2413))

### Fixed

- Properly handle invalid interfaces during test ([#2433](https://github.com/MetaMask/snaps/pull/2433))
- Properly diff when using legacy UI with `toRender` matcher ([#2432](https://github.com/MetaMask/snaps/pull/2432))

## [8.0.0]

### Added

- **BREAKING:** Add JSX support for custom UI ([#2258](https://github.com/MetaMask/snaps/pull/2258))
  - It's now possible to use JSX components from `@metamask/snaps-sdk` to build
    user interfaces for Snaps.
  - This is a breaking change, because the legacy user interfaces are converted
    to the new JSX format.
    - If you are checking the format of a interface without `toRender`, you will
      need to update your tests to check the JSX format.

### Changed

- Bump `@metamask/base-controller` from `5.0.1` to `5.0.2` ([#2375](https://github.com/MetaMask/snaps/pull/2375))

## [7.0.2]

### Changed

- Bump `@metamask/snaps-execution-environments` to latest ([#2339](https://github.com/MetaMask/snaps/pull/2339))

## [7.0.1]

### Fixed

- Improve correctness of `clickElement` ([#2334](https://github.com/MetaMask/snaps/pull/2334))
  - The function should now behave closer to the client implementation.

## [7.0.0]

### Added

- **BREAKING:** Support Interactive UI in `snaps-jest` ([#2286](https://github.com/MetaMask/snaps/pull/2286))
  - Remove `content` from the Snap response, instead `getInterface()` must be used
  - `clickElement` and `typeInField` can be used on the interface return value to simulate actions

### Changed

- Improve Jest expect types ([#2308](https://github.com/MetaMask/snaps/pull/2308))
- Refactor to support changes to encryption ([#2316](https://github.com/MetaMask/snaps/pull/2316))

## [6.0.2]

### Changed

- Bump MetaMask dependencies ([#2270](https://github.com/MetaMask/snaps/pull/2270))
- Bump @metamask/json-rpc-engine from 7.3.2 to 7.3.3 ([#2247](https://github.com/MetaMask/snaps/pull/2247))

## [6.0.1]

### Fixed

- Fix minor build configuration problems ([#2220](https://github.com/MetaMask/snaps/pull/2220))

## [6.0.0]

### Changed

- **BREAKING:** Update ESM build to be fully compliant with the ESM standard ([#2210](https://github.com/MetaMask/snaps/pull/2210))
- **BREAKING:** Move Node.js exports to separate export ([#2210](https://github.com/MetaMask/snaps/pull/2210))
  - The default export is now browser-compatible.
  - Node.js APIs can be imported from `<package>/node`.
- Bump `@metamask/rpc-errors` to `^6.2.1` ([#2209](https://github.com/MetaMask/snaps/pull/2209))

## [5.0.0]

### Added

- **BREAKING:** Implement testing framework using Node.js executor ([#1982](https://github.com/MetaMask/snaps/pull/1982), [#2118](https://github.com/MetaMask/snaps/pull/2118))
  - The network mocking functionality was removed, but may be reintroduced in a future version.
  - `mockJsonRpc` no longer returns a `Promise`.
  - `runCronjob` was renamed to `onCronjob`, and `sendTransaction` was renamed to `onTransaction`.
    - For backwards compatibility, the old methods are still available, but will be removed in a future version.
- Add `onHomePage` support ([#2104](https://github.com/MetaMask/snaps/pull/2104))
- Add `onSignature` support ([#2114](https://github.com/MetaMask/snaps/pull/2114))
- Add `snap_getClientStatus` support ([#2159](https://github.com/MetaMask/snaps/pull/2159))

### Changed

- Bump several MetaMask dependencies ([#2101](https://github.com/MetaMask/snaps/pull/2101), [#2100](https://github.com/MetaMask/snaps/pull/2100), [#2129](https://github.com/MetaMask/snaps/pull/2129), [#2140](https://github.com/MetaMask/snaps/pull/2140), [#2141](https://github.com/MetaMask/snaps/pull/2141), [#2142](https://github.com/MetaMask/snaps/pull/2142))

## [4.0.1]

### Fixed

- Fix coercing of address values in `sendTransaction` function ([#1970](https://github.com/MetaMask/snaps/pull/1970))

## [4.0.0]

### Changed

- Use `@metamask/snaps-sdk` package ([#1930](https://github.com/MetaMask/snaps/pull/1930),
  [#1950](https://github.com/MetaMask/snaps/pull/1950), [#1954](https://github.com/MetaMask/snaps/pull/1954))
  - This package replaces the `@metamask/snaps-types` and
  - `@metamask/snaps-ui` packages.

### Removed

- **BREAKING**: `DialogType`, `ManageStateOperation`, `NotificationType` are no
  longer re-exported from `@metamask/snaps-jest` ([#1930](https://github.com/MetaMask/snaps/pull/1930))
  - These enums can now be imported from `@metamask/snaps-sdk` instead.

## [3.1.0]

### Added

- Add support for links in custom UI and notifications ([#1814](https://github.com/MetaMask/snaps/pull/1814))

## [3.0.0]

### Changed

- **BREAKING:** Improve error handling ([#1841](https://github.com/MetaMask/snaps/pull/1841))
  - This is a breaking change, because errors returned by the Snap now have a different format. For example, if the Snap throws a JSON-RPC method not found error, previously, the following error would be returned:
    ```ts
    {
      code: -32603,
      message: 'Internal JSON-RPC error.',
      data: {
        cause: {
          message: 'The method does not exist / is not available.',
          stack: expect.any(String),
        },
      },
    }
    ```
    Now, the following error is returned instead:
    ```ts
    {
      code: -32601,
      message: 'The method does not exist / is not available.',
      stack: expect.any(String),
      data: {
        method: 'foo',
        cause: null,
      },
    }
    ```

## [2.0.0]

### Changed

- **BREAKING:** Bump minimum Node.js version to `^18.16.0` ([#1741](https://github.com/MetaMask/snaps/pull/1741))

## [1.0.0]

### Changed

- Initial stable release from main branch ([#1757](https://github.com/MetaMask/snaps/pull/1757))

## [0.37.5-flask.1]

### Changed

- Bump `metamask/utils` and `metamask/snaps-registry` ([#1738](https://github.com/MetaMask/snaps/pull/1738), [#1694](https://github.com/MetaMask/snaps/pull/1694))

## [0.37.4-flask.1]

### Fixed

- Remove unused dependencies ([#1680](https://github.com/MetaMask/snaps/pull/1680))

## [0.37.3-flask.1]

### Changed

- Bump `semver` to `^7.5.4` ([#1631](https://github.com/MetaMask/snaps/pull/1631))

## [0.37.2-flask.1]

### Changed

- Release package independently ([#1600](https://github.com/MetaMask/snaps/pull/1600))
  - The version of the package no longer needs to match the version of all other
    MetaMask Snaps packages.

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@9.8.0...HEAD
[9.8.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@9.7.0...@metamask/snaps-jest@9.8.0
[9.7.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@9.6.0...@metamask/snaps-jest@9.7.0
[9.6.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@9.5.1...@metamask/snaps-jest@9.6.0
[9.5.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@9.5.0...@metamask/snaps-jest@9.5.1
[9.5.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@9.4.1...@metamask/snaps-jest@9.5.0
[9.4.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@9.4.0...@metamask/snaps-jest@9.4.1
[9.4.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@9.3.0...@metamask/snaps-jest@9.4.0
[9.3.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@9.2.0...@metamask/snaps-jest@9.3.0
[9.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@9.1.0...@metamask/snaps-jest@9.2.0
[9.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@9.0.0...@metamask/snaps-jest@9.1.0
[9.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@8.16.0...@metamask/snaps-jest@9.0.0
[8.16.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@8.15.0...@metamask/snaps-jest@8.16.0
[8.15.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@8.14.1...@metamask/snaps-jest@8.15.0
[8.14.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@8.14.0...@metamask/snaps-jest@8.14.1
[8.14.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@8.13.0...@metamask/snaps-jest@8.14.0
[8.13.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@8.12.0...@metamask/snaps-jest@8.13.0
[8.12.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@8.11.0...@metamask/snaps-jest@8.12.0
[8.11.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@8.10.0...@metamask/snaps-jest@8.11.0
[8.10.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@8.9.0...@metamask/snaps-jest@8.10.0
[8.9.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@8.8.1...@metamask/snaps-jest@8.9.0
[8.8.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@8.8.0...@metamask/snaps-jest@8.8.1
[8.8.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@8.7.1...@metamask/snaps-jest@8.8.0
[8.7.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@8.7.0...@metamask/snaps-jest@8.7.1
[8.7.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@8.6.0...@metamask/snaps-jest@8.7.0
[8.6.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@8.5.0...@metamask/snaps-jest@8.6.0
[8.5.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@8.4.0...@metamask/snaps-jest@8.5.0
[8.4.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@8.3.2...@metamask/snaps-jest@8.4.0
[8.3.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@8.3.1...@metamask/snaps-jest@8.3.2
[8.3.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@8.3.0...@metamask/snaps-jest@8.3.1
[8.3.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@8.2.0...@metamask/snaps-jest@8.3.0
[8.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@8.1.3...@metamask/snaps-jest@8.2.0
[8.1.3]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@8.1.2...@metamask/snaps-jest@8.1.3
[8.1.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@8.1.1...@metamask/snaps-jest@8.1.2
[8.1.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@8.1.0...@metamask/snaps-jest@8.1.1
[8.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@8.0.0...@metamask/snaps-jest@8.1.0
[8.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@7.0.2...@metamask/snaps-jest@8.0.0
[7.0.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@7.0.1...@metamask/snaps-jest@7.0.2
[7.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@7.0.0...@metamask/snaps-jest@7.0.1
[7.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@6.0.2...@metamask/snaps-jest@7.0.0
[6.0.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@6.0.1...@metamask/snaps-jest@6.0.2
[6.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@6.0.0...@metamask/snaps-jest@6.0.1
[6.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@5.0.0...@metamask/snaps-jest@6.0.0
[5.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@4.0.1...@metamask/snaps-jest@5.0.0
[4.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@4.0.0...@metamask/snaps-jest@4.0.1
[4.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@3.1.0...@metamask/snaps-jest@4.0.0
[3.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@3.0.0...@metamask/snaps-jest@3.1.0
[3.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@2.0.0...@metamask/snaps-jest@3.0.0
[2.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@1.0.0...@metamask/snaps-jest@2.0.0
[1.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@0.37.5-flask.1...@metamask/snaps-jest@1.0.0
[0.37.5-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@0.37.4-flask.1...@metamask/snaps-jest@0.37.5-flask.1
[0.37.4-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@0.37.3-flask.1...@metamask/snaps-jest@0.37.4-flask.1
[0.37.3-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@0.37.2-flask.1...@metamask/snaps-jest@0.37.3-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps/releases/tag/@metamask/snaps-jest@0.37.2-flask.1
