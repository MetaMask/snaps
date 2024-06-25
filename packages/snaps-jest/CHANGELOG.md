# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@8.2.0...HEAD
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
