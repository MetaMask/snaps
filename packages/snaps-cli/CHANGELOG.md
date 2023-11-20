# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.0.3]
### Uncategorized
- Add row and address component ([#1968](https://github.com/MetaMask/snaps-skunkworks.git/pull/1968))
- Bump several MetaMask dependencies ([#1964](https://github.com/MetaMask/snaps-skunkworks.git/pull/1964))

## [3.0.2]
### Changed
- Use `@metamask/snaps-sdk` package ([#1951](https://github.com/MetaMask/snaps/pull/1951))
  - This package replaces the `@metamask/snaps-types` and
    `@metamask/snaps-ui` packages.

## [3.0.1]
### Changed
- Bump Babel packages from `^7.20.12` to `^7.23.2` ([#1862](https://github.com/MetaMask/snaps/pull/1862))
- Update multiple MetaMask dependencies ([#1841](https://github.com/MetaMask/snaps/pull/1841))

## [3.0.0]
### Changed
- **BREAKING:** Bump minimum Node.js version to `^18.16.0` ([#1741](https://github.com/MetaMask/snaps/pull/1741))

## [2.0.2]
### Fixed
- Fix Webpack being unable to find `swc-loader` in some cases ([#1798](https://github.com/MetaMask/snaps/pull/1798))
- Check minimum Node version in CLI ([#1797](https://github.com/MetaMask/snaps/pull/1797))

## [2.0.1]
### Fixed
- Disable the `fullySpecified` rule for `.js` imports in the default Webpack config ([#1780](https://github.com/MetaMask/snaps/pull/1780))

## [2.0.0]
### Changed
- Initial stable release from main branch ([#1757](https://github.com/MetaMask/snaps/pull/1757))

## [0.38.4-flask.1]
### Changed
- Bump `metamask/utils` and `metamask/snaps-registry` ([#1738](https://github.com/MetaMask/snaps/pull/1738), [#1694](https://github.com/MetaMask/snaps/pull/1694))

## [0.38.3-flask.1]
### Fixed
- Remove unused dependencies ([#1680](https://github.com/MetaMask/snaps/pull/1680))

## [0.38.2-flask.1]
### Added
- Add `polyfills` option to Webpack configuration ([#1650](https://github.com/MetaMask/snaps/pull/1650))

### Fixed
- Fix breaking change to SWC causing the CLI to break ([#1677](https://github.com/MetaMask/snaps/pull/1677))

## [0.38.1-flask.1]
### Changed
- Update all examples to use Webpack ([#1632](https://github.com/MetaMask/snaps/pull/1632))

## [0.38.0-flask.1]
### Added
- Add support for bundling with Webpack ([#1521](https://github.com/MetaMask/snaps/pull/1521))
  - For backwards compatibility, the Webpack bundler is opt-in. To use it, add
    `"bundler": "webpack"` to your snap configuration file, and follow the new
    configuration format described in the documentation.
  - The new configuration format also adds support for:
    - Setting environment variables, which are set as `process.env` values in
      the bundled code.
    - Importing WebAssembly modules (if `experimental.wasm` is enabled in the
      snap configuration file).
- Support TypeScript snap configuration files ([#1521](https://github.com/MetaMask/snaps/pull/1521))

### Changed
- Release package independently ([#1600](https://github.com/MetaMask/snaps/pull/1600))
  - The version of the package no longer needs to match the version of all other
    MetaMask Snaps packages.

[Unreleased]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-cli@3.0.3...HEAD
[3.0.3]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-cli@3.0.2...@metamask/snaps-cli@3.0.3
[3.0.2]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-cli@3.0.1...@metamask/snaps-cli@3.0.2
[3.0.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-cli@3.0.0...@metamask/snaps-cli@3.0.1
[3.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-cli@2.0.2...@metamask/snaps-cli@3.0.0
[2.0.2]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-cli@2.0.1...@metamask/snaps-cli@2.0.2
[2.0.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-cli@2.0.0...@metamask/snaps-cli@2.0.1
[2.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-cli@0.38.4-flask.1...@metamask/snaps-cli@2.0.0
[0.38.4-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-cli@0.38.3-flask.1...@metamask/snaps-cli@0.38.4-flask.1
[0.38.3-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-cli@0.38.2-flask.1...@metamask/snaps-cli@0.38.3-flask.1
[0.38.2-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-cli@0.38.1-flask.1...@metamask/snaps-cli@0.38.2-flask.1
[0.38.1-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-cli@0.38.0-flask.1...@metamask/snaps-cli@0.38.1-flask.1
[0.38.0-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/releases/tag/@metamask/snaps-cli@0.38.0-flask.1
