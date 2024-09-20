# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Uncategorized

- Update Yarn constraints to use JavaScript-based constraints ([#2740](https://github.com/MetaMask/snaps/pull/2740))
- Update metadata for all packages ([#2748](https://github.com/MetaMask/snaps/pull/2748))
- Add `since-latest-release` script to match `MetaMask/core` ([#2744](https://github.com/MetaMask/snaps/pull/2744))
- Update test scripts to match `MetaMask/core` ([#2745](https://github.com/MetaMask/snaps/pull/2745))
- Fix linting of `package.json` files ([#2742](https://github.com/MetaMask/snaps/pull/2742))
- Update changelog validation scripts to match `MetaMask/core` ([#2741](https://github.com/MetaMask/snaps/pull/2741))
- Add `center` prop to `Box` component ([#2716](https://github.com/MetaMask/snaps/pull/2716))
- Fix type issue with `Field` children ([#2715](https://github.com/MetaMask/snaps/pull/2715))
- Added form property to Button JSX component ([#2712](https://github.com/MetaMask/snaps/pull/2712))

## [2.1.3]

### Fixed

- Bump MetaMask dependencies

## [2.1.2]

### Changed

- Use error wrappers ([#2178](https://github.com/MetaMask/snaps/pull/2178))

## [2.1.1]

### Changed

- Remove snap icon ([#2189](https://github.com/MetaMask/snaps/pull/2189))

## [2.1.0]

### Changed

- Use `@metamask/snaps-sdk` package ([#1946](https://github.com/MetaMask/snaps/pull/1946))
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

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/browserify-plugin-example-snap@2.1.3...HEAD
[2.1.3]: https://github.com/MetaMask/snaps/compare/@metamask/browserify-plugin-example-snap@2.1.2...@metamask/browserify-plugin-example-snap@2.1.3
[2.1.2]: https://github.com/MetaMask/snaps/compare/@metamask/browserify-plugin-example-snap@2.1.1...@metamask/browserify-plugin-example-snap@2.1.2
[2.1.1]: https://github.com/MetaMask/snaps/compare/@metamask/browserify-plugin-example-snap@2.1.0...@metamask/browserify-plugin-example-snap@2.1.1
[2.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/browserify-plugin-example-snap@2.0.1...@metamask/browserify-plugin-example-snap@2.1.0
[2.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/browserify-plugin-example-snap@2.0.0...@metamask/browserify-plugin-example-snap@2.0.1
[2.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/browserify-plugin-example-snap@1.0.0...@metamask/browserify-plugin-example-snap@2.0.0
[1.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/browserify-plugin-example-snap@0.37.3-flask.1...@metamask/browserify-plugin-example-snap@1.0.0
[0.37.3-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/browserify-plugin-example-snap@0.37.2-flask.1...@metamask/browserify-plugin-example-snap@0.37.3-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps/releases/tag/@metamask/browserify-plugin-example-snap@0.37.2-flask.1
