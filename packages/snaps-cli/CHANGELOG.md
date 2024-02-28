# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [6.0.2]
### Fixed
- Publish `.browserslistrc` ([#2227](https://github.com/MetaMask/snaps/pull/2227))

## [6.0.1]
### Fixed
- Fix minor build configuration problems ([#2220](https://github.com/MetaMask/snaps/pull/2220))

## [6.0.0]
### Changed
- **BREAKING:** Update ESM build to be fully compliant with the ESM standard ([#2210](https://github.com/MetaMask/snaps/pull/2210))
- **BREAKING:** Change config to use Webpack by default ([#2214](https://github.com/MetaMask/snaps/pull/2214))
  - You can still use Browserify by specifying `bundler: 'browserify'`.

## [5.1.1]
### Fixed
- Support new lines in CLI message formatting ([#2194](https://github.com/MetaMask/snaps/pull/2194))

## [5.1.0]
### Changed
- Optimize CLI Webpack configuration ([#2175](https://github.com/MetaMask/snaps/pull/2175))
  - This can reduce the size of Snaps in certain cases.
- Show Webpack compilation warnings in CLI ([#2186](https://github.com/MetaMask/snaps/pull/2186), [#2192](https://github.com/MetaMask/snaps/pull/2192))
- Add a warning when no icon is found and when icon is not square ([#2185](https://github.com/MetaMask/snaps/pull/2185))

## [5.0.0]
### Changed
- **BREAKING:** Disable source maps by default ([#2166](https://github.com/MetaMask/snaps/pull/2166))
  - This slightly speeds up the build process.
  - You can enable source maps again by setting `sourceMap: true` in your Snap config.
- Set `output.chunkFormat` to `commonjs` by default ([#2136](https://github.com/MetaMask/snaps/pull/2136))

## [4.0.1]
### Fixed
- Fix missing `global` during snap evaluation ([#2072](https://github.com/MetaMask/snaps/pull/2072))

## [4.0.0]
### Changed
- **BREAKING:** Synchronously initialize WASM modules ([#2024](https://github.com/MetaMask/snaps/pull/2024))
  - When the `experimental.wasm` flag in the Snaps CLI is enabled, the WASM module will now be synchronously initialized, rather than being inlined as a Uint8Array.

## [3.0.5]
### Fixed
- Include Snap icon in allowed server paths ([#2003](https://github.com/MetaMask/snaps/pull/2003))

## [3.0.4]
### Fixed
- Only serve Snap files from CLI ([#1979](https://github.com/MetaMask/snaps/pull/1979))

## [3.0.3]
### Changed
- Bump several MetaMask dependencies ([#1964](https://github.com/MetaMask/snaps/pull/1964))

### Fixed
- Fix issues generating checksum with binary auxiliary files ([#1975](https://github.com/MetaMask/snaps/pull/1975))

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

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@6.0.2...HEAD
[6.0.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@6.0.1...@metamask/snaps-cli@6.0.2
[6.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@6.0.0...@metamask/snaps-cli@6.0.1
[6.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@5.1.1...@metamask/snaps-cli@6.0.0
[5.1.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@5.1.0...@metamask/snaps-cli@5.1.1
[5.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@5.0.0...@metamask/snaps-cli@5.1.0
[5.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@4.0.1...@metamask/snaps-cli@5.0.0
[4.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@4.0.0...@metamask/snaps-cli@4.0.1
[4.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@3.0.5...@metamask/snaps-cli@4.0.0
[3.0.5]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@3.0.4...@metamask/snaps-cli@3.0.5
[3.0.4]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@3.0.3...@metamask/snaps-cli@3.0.4
[3.0.3]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@3.0.2...@metamask/snaps-cli@3.0.3
[3.0.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@3.0.1...@metamask/snaps-cli@3.0.2
[3.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@3.0.0...@metamask/snaps-cli@3.0.1
[3.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@2.0.2...@metamask/snaps-cli@3.0.0
[2.0.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@2.0.1...@metamask/snaps-cli@2.0.2
[2.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@2.0.0...@metamask/snaps-cli@2.0.1
[2.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@0.38.4-flask.1...@metamask/snaps-cli@2.0.0
[0.38.4-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@0.38.3-flask.1...@metamask/snaps-cli@0.38.4-flask.1
[0.38.3-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@0.38.2-flask.1...@metamask/snaps-cli@0.38.3-flask.1
[0.38.2-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@0.38.1-flask.1...@metamask/snaps-cli@0.38.2-flask.1
[0.38.1-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@0.38.0-flask.1...@metamask/snaps-cli@0.38.1-flask.1
[0.38.0-flask.1]: https://github.com/MetaMask/snaps/releases/tag/@metamask/snaps-cli@0.38.0-flask.1
