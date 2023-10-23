# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@3.0.0...HEAD
[3.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@2.0.0...@metamask/snaps-jest@3.0.0
[2.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@1.0.0...@metamask/snaps-jest@2.0.0
[1.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@0.37.5-flask.1...@metamask/snaps-jest@1.0.0
[0.37.5-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@0.37.4-flask.1...@metamask/snaps-jest@0.37.5-flask.1
[0.37.4-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@0.37.3-flask.1...@metamask/snaps-jest@0.37.4-flask.1
[0.37.3-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-jest@0.37.2-flask.1...@metamask/snaps-jest@0.37.3-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps/releases/tag/@metamask/snaps-jest@0.37.2-flask.1
