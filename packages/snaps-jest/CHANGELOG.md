# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [5.0.0]

### Uncategorized

- [BREAKING] Add support for interactive UI to `snap_dialog` ([#2143](https://github.com/MetaMask/snaps-skunkworks.git/pull/2143))
- Add `snap_getClientStatus` example snap ([#2159](https://github.com/MetaMask/snaps-skunkworks.git/pull/2159))
- [BREAKING] Move endowments from Controllers to RPC methods ([#2155](https://github.com/MetaMask/snaps-skunkworks.git/pull/2155))
- Add support for snap defined execution timeouts ([#2098](https://github.com/MetaMask/snaps-skunkworks.git/pull/2098))
- **BREAKING**: Update name lookup API ([#2113](https://github.com/MetaMask/snaps-skunkworks.git/pull/2113))
- Bump @metamask/permission-controller from 7.1.0 to 8.0.0 ([#2142](https://github.com/MetaMask/snaps-skunkworks.git/pull/2142))
- Bump @metamask/json-rpc-middleware-stream from 6.0.1 to 6.0.2 ([#2141](https://github.com/MetaMask/snaps-skunkworks.git/pull/2141))
- Bump @metamask/eth-json-rpc-middleware from 12.0.1 to 12.1.0 ([#2140](https://github.com/MetaMask/snaps-skunkworks.git/pull/2140))
- Bump @metamask/json-rpc-engine from 7.3.1 to 7.3.2 ([#2129](https://github.com/MetaMask/snaps-skunkworks.git/pull/2129))
- Add `onSignature` support to `snaps-jest` ([#2114](https://github.com/MetaMask/snaps-skunkworks.git/pull/2114))
- Rename snaps-jest APIs ([#2118](https://github.com/MetaMask/snaps-skunkworks.git/pull/2118))
- Bump SES and LavaMoat ([#2105](https://github.com/MetaMask/snaps-skunkworks.git/pull/2105))
- Add home page support to `snaps-jest` ([#2104](https://github.com/MetaMask/snaps-skunkworks.git/pull/2104))
- Bump @metamask/utils from 8.2.1 to 8.3.0 ([#2100](https://github.com/MetaMask/snaps-skunkworks.git/pull/2100))
- Bump @metamask/json-rpc-middleware-stream from 6.0.0 to 6.0.1 ([#2101](https://github.com/MetaMask/snaps-skunkworks.git/pull/2101))
- BREAKING: Implement testing framework using Node.js executor ([#1982](https://github.com/MetaMask/snaps-skunkworks.git/pull/1982))
- Bump @metamask/auto-changelog from 3.4.3 to 3.4.4 ([#2054](https://github.com/MetaMask/snaps-skunkworks.git/pull/2054))

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

[Unreleased]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-jest@5.0.0...HEAD
[5.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-jest@4.0.1...@metamask/snaps-jest@5.0.0
[4.0.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-jest@4.0.0...@metamask/snaps-jest@4.0.1
[4.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-jest@3.1.0...@metamask/snaps-jest@4.0.0
[3.1.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-jest@3.0.0...@metamask/snaps-jest@3.1.0
[3.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-jest@2.0.0...@metamask/snaps-jest@3.0.0
[2.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-jest@1.0.0...@metamask/snaps-jest@2.0.0
[1.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-jest@0.37.5-flask.1...@metamask/snaps-jest@1.0.0
[0.37.5-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-jest@0.37.4-flask.1...@metamask/snaps-jest@0.37.5-flask.1
[0.37.4-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-jest@0.37.3-flask.1...@metamask/snaps-jest@0.37.4-flask.1
[0.37.3-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-jest@0.37.2-flask.1...@metamask/snaps-jest@0.37.3-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/releases/tag/@metamask/snaps-jest@0.37.2-flask.1
