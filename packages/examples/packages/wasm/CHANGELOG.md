# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Uncategorized

- release: `114.0.0` ([#3463](https://github.com/MetaMask/snaps/pull/3463))
- release: `113.0.0` ([#3448](https://github.com/MetaMask/snaps/pull/3448))
- chore!: Drop support for Node.js 18 and 21 ([#3447](https://github.com/MetaMask/snaps/pull/3447))
- chore: Update TypeScript build target to ES2022 ([#3444](https://github.com/MetaMask/snaps/pull/3444))
- chore: Bump `@swc/core`, `@swc/jest`, and `swc-loader` to latest version ([#3442](https://github.com/MetaMask/snaps/pull/3442))
- release: `110.0.0` ([#3425](https://github.com/MetaMask/snaps/pull/3425))
- Release 109.0.0 ([#3412](https://github.com/MetaMask/snaps/pull/3412))
- release: 107.0.0 ([#3400](https://github.com/MetaMask/snaps/pull/3400))
- release: 104.0.0 ([#3384](https://github.com/MetaMask/snaps/pull/3384))
- chore(deps-dev): bump @lavamoat/allow-scripts from 3.0.4 to 3.3.3 ([#3378](https://github.com/MetaMask/snaps/pull/3378))
- chore!: Build Snaps execution environments with Webpack ([#3322](https://github.com/MetaMask/snaps/pull/3322))
- chore(deps-dev): bump @metamask/auto-changelog from 5.0.1 to 5.0.2 ([#3369](https://github.com/MetaMask/snaps/pull/3369))
- release: 103.0.0 ([#3360](https://github.com/MetaMask/snaps/pull/3360))

## [2.1.5]

### Fixed

- Remove deprecated Browserify options ([#3313](https://github.com/MetaMask/snaps/pull/3313))

## [2.1.4]

### Fixed

- Bump MetaMask dependencies

## [2.1.3]

### Changed

- Use error wrappers ([#2178](https://github.com/MetaMask/snaps/pull/2178))

## [2.1.2]

### Changed

- Remove snap icon ([#2189](https://github.com/MetaMask/snaps/pull/2189))

## [2.1.1]

### Changed

- Use synchronously initialized WASM ([#2024](https://github.com/MetaMask/snaps/pull/2024))

## [2.1.0]

### Changed

- Use `@metamask/snaps-sdk` package ([#1946](https://github.com/MetaMask/snaps/pull/1946), [#1954](https://github.com/MetaMask/snaps/pull/1954))
  - This package replaces the `@metamask/snaps-types` and
  - `@metamask/snaps-ui` packages, and is much more lightweight.

## [2.0.1]

### Changed

- Update multiple MetaMask dependencies ([#1841](https://github.com/MetaMask/snaps/pull/1841))

## [2.0.0]

### Changed

- **BREAKING:** Bump minimum Node.js version to `^18.16.0` ([#1741](https://github.com/MetaMask/snaps/pull/1741))

## [1.0.0]

### Changed

- Initial stable release from main branch ([#1757](https://github.com/MetaMask/snaps/pull/1757))

## [0.37.3-flask.1]

### Fixed

- Remove unused dependencies ([#1680](https://github.com/MetaMask/snaps/pull/1680))

## [0.37.2-flask.1]

### Changed

- Release package independently ([#1600](https://github.com/MetaMask/snaps/pull/1600))
  - The version of the package no longer needs to match the version of all other
    MetaMask Snaps packages.

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/wasm-example-snap@2.1.5...HEAD
[2.1.5]: https://github.com/MetaMask/snaps/compare/@metamask/wasm-example-snap@2.1.4...@metamask/wasm-example-snap@2.1.5
[2.1.4]: https://github.com/MetaMask/snaps/compare/@metamask/wasm-example-snap@2.1.3...@metamask/wasm-example-snap@2.1.4
[2.1.3]: https://github.com/MetaMask/snaps/compare/@metamask/wasm-example-snap@2.1.2...@metamask/wasm-example-snap@2.1.3
[2.1.2]: https://github.com/MetaMask/snaps/compare/@metamask/wasm-example-snap@2.1.1...@metamask/wasm-example-snap@2.1.2
[2.1.1]: https://github.com/MetaMask/snaps/compare/@metamask/wasm-example-snap@2.1.0...@metamask/wasm-example-snap@2.1.1
[2.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/wasm-example-snap@2.0.1...@metamask/wasm-example-snap@2.1.0
[2.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/wasm-example-snap@2.0.0...@metamask/wasm-example-snap@2.0.1
[2.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/wasm-example-snap@1.0.0...@metamask/wasm-example-snap@2.0.0
[1.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/wasm-example-snap@0.37.3-flask.1...@metamask/wasm-example-snap@1.0.0
[0.37.3-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/wasm-example-snap@0.37.2-flask.1...@metamask/wasm-example-snap@0.37.3-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps/releases/tag/@metamask/wasm-example-snap@0.37.2-flask.1
