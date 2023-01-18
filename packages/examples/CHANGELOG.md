# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.28.0]
### Changed
- No changes this release.

## [0.27.1]
### Changed
- No changes this release.

## [0.27.0]
### Changed
- **BREAKING:** Use custom UI in `snap_dialog` ([#1051](https://github.com/MetaMask/snaps-monorepo/pull/1051))
- **BREAKING:** Use custom UI in transaction insights ([#1047](https://github.com/MetaMask/snaps-monorepo/pull/1047))
- **BREAKING:** Move all internal types from `snaps-types` to `snaps-utils` ([#1060](https://github.com/MetaMask/snaps-monorepo/pull/1060))

## [0.26.2]
### Changed
- No changes this release.

## [0.26.1]
### Changed
- No changes this release.

## [0.26.0]
### Changed
- No changes this release.

## [0.25.0]
### Changed
- No changes this release.

## [0.24.1]
### Changed
- No changes this release.

## [0.24.0]
### Added
- Add `snap_getEntropy` JSON-RPC method ([#940](https://github.com/MetaMask/snaps-monorepo/pull/940))

### Changed
- **BREAKING:** Remove `wallet` global in favor of `snap` and `ethereum` ([#939](https://github.com/MetaMask/snaps-monorepo/pull/939), [#964](https://github.com/MetaMask/snaps-monorepo/pull/964))
- Remove `wallet_enable` from examples ([#949](https://github.com/MetaMask/snaps-monorepo/pull/949))

## [0.23.0]
### Changed
- No changes this release.

## [0.22.3]
### Added
- Add transaction insights example snap ([#838](https://github.com/MetaMask/snaps-monorepo/pull/838))

## [0.22.2]
### Changed
- No changes this release.

## [0.22.1]
### Changed
- No changes this release.

## [0.22.0]
### Changed
- No changes this release.

## [0.21.0]
### Added
- Run eval and fix manifest in bundler plugins ([#731](https://github.com/MetaMask/snaps-monorepo/pull/731))

## [0.20.0]
### Changed
- No changes this release.

## [0.19.1]
### Added
- Generate source maps from modified code ([#615](https://github.com/MetaMask/snaps-monorepo/pull/615))

## [0.19.0]
### Changed
- No changes this release.

## [0.18.1]
### Changed
- No changes this release.

## [0.18.0]
### Changed
- Reduce TypeScript compilation target to ES2017 ([#628](https://github.com/MetaMask/snaps-monorepo/pull/628))

## [0.17.0]
### Changed
- **BREAKING:** Bump minimum Node version to 16 ([#601](https://github.com/MetaMask/snaps-monorepo/pull/601))

## [0.16.0]
### Added
- Add Browserify Snap example ([#478](https://github.com/MetaMask/snaps-monorepo/pull/478))
- Add CLI as dependency to examples ([#528](https://github.com/MetaMask/snaps-monorepo/pull/528))

### Changed
- **BREAKING:** Update examples to use CommonJS exported `onRpcRequest` and named parameters ([#481](https://github.com/MetaMask/snaps-monorepo/pull/481), [#533](https://github.com/MetaMask/snaps-monorepo/pull/533), [#538](https://github.com/MetaMask/snaps-monorepo/pull/538), [#541](https://github.com/MetaMask/snaps-monorepo/pull/541))
- Update TypeScript example to use `OnRpcRequestHandler` ([#531](https://github.com/MetaMask/snaps-monorepo/pull/531), [#533](https://github.com/MetaMask/snaps-monorepo/pull/533), [#538](https://github.com/MetaMask/snaps-monorepo/pull/538))
- Update TypeScript example to use multiple files ([#527](https://github.com/MetaMask/snaps-monorepo/pull/527))

## [0.15.0]
### Added
- Add Rollup Snap example ([#472](https://github.com/MetaMask/snaps-monorepo/pull/472))
- Add Webpack Snap example ([#462](https://github.com/MetaMask/snaps-monorepo/pull/462))
- Add TypeScript Snap example ([#443](https://github.com/MetaMask/snaps-monorepo/pull/443))

## [0.14.0]
### Changed
- No changes this release.

## [0.13.0]
### Changed
- No changes this release.

## [0.12.0]
### Changed
- No changes this release.

## [0.11.1]
### Changed
- No changes this release.

## [0.11.0]
### Added
- Add WebAssembly example snap ([#242](https://github.com/MetaMask/snaps-monorepo/pull/242), [#381](https://github.com/MetaMask/snaps-monorepo/pull/381), [#371](https://github.com/MetaMask/snaps-monorepo/pull/371))

### Changed
- Upgraded TypeScript version to minimum 4.4 ([#360](https://github.com/MetaMask/snaps-monorepo/pull/360))

## [0.10.7]
### Changed
- **BREAKING:** Bump minimum Node version from 12 to 14 ([#331](https://github.com/MetaMask/snaps-monorepo/pull/331))

## [0.10.6]
### Changed
- No changes this release.

## [0.10.5]
### Changed
- No changes this release.

## [0.10.3]
### Added
- Add notification example snap ([#248](https://github.com/MetaMask/snaps-monorepo/pull/248))

## [0.10.0]
### Changed
- **BREAKING:** Update config files per `@metamask/snaps-cli@0.10.0` ([#251](https://github.com/MetaMask/snaps-monorepo/pull/251))

### Fixed
- Ensure that all examples work with the current Snaps implementation ([#219](https://github.com/MetaMask/snaps-monorepo/pull/219))

## [0.9.0]
### Changed
- No changes this release.

## [0.8.0]
### Changed
- No changes this release.

## [0.7.0]
### Changed
- No changes this release.

## [0.6.3]
### Changed
- No changes this release.

## [0.6.2]
### Changed
- No changes this release.

## [0.6.1]
### Fixed
- `bls-signer` example Snap `snap_confirm` call ([#168](https://github.com/MetaMask/snaps-monorepo/pull/168))
  - The `bls-signer` Snap was passing invalid parameters to the method.

## [0.6.0]
### Changed
- **BREAKING:** Support the new Snaps publishing specification ([#140](https://github.com/MetaMask/snaps-monorepo/pull/140))
  - This introduces several breaking changes to how Snaps are developed, hosted, and represented at runtime. See [the specification](https://github.com/MetaMask/specifications/blob/d4a5bf5d6990bb5b02a98bd3f95a24ffb28c701c/snaps/publishing.md) and the referenced pull request for details.
- **BREAKING:** Update all example Snaps per new publishing specification ([#157](https://github.com/MetaMask/snaps-monorepo/pull/157))

### Removed
- **BREAKING:** "hello-snaps` example ([#157](https://github.com/MetaMask/snaps-monorepo/pull/157))

## [0.5.0]
### Changed
- No changes this release.

## [0.4.0]
### Changed
- No changes this release.

## [0.3.1]
### Changed
- No changes this release.

## [0.3.0]
### Changed
- **BREAKING:** Enforce consistent naming for Snaps-related functionality ([#119](https://github.com/MetaMask/snaps-monorepo/pull/119))

## [0.2.2]
### Fixed
- Package script issues ([#97](https://github.com/MetaMask/snaps-monorepo/pull/97), [#98](https://github.com/MetaMask/snaps-monorepo/pull/98))


## [0.2.0]
### Changed
- Update publish scripts ([#92](https://github.com/MetaMask/snaps-monorepo/pull/92))

## [0.1.1]
### Added
- Add missing publish scripts to new packages

### Changed
- Fix examples compatibility issues

## [0.1.0]
### Changed
- Initial release ([#72](https://github.com/MetaMask/snaps-monorepo/pull/72))
  - This package was previously a subset of [`snaps-cli`](https://github.com/MetaMask/snaps-cli/tree/main/examples), which has been renamed to [`@metamask/snaps-cli`](https://npmjs.com/package/@metamask/snaps-cli).
  - Some examples have been deleted because they were outdated.

[Unreleased]: https://github.com/MetaMask/snaps-monorepo/compare/v0.28.0...HEAD
[0.28.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.27.1...v0.28.0
[0.27.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.27.0...v0.27.1
[0.27.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.26.2...v0.27.0
[0.26.2]: https://github.com/MetaMask/snaps-monorepo/compare/v0.26.1...v0.26.2
[0.26.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.26.0...v0.26.1
[0.26.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.25.0...v0.26.0
[0.25.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.24.1...v0.25.0
[0.24.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.24.0...v0.24.1
[0.24.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.23.0...v0.24.0
[0.23.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.22.3...v0.23.0
[0.22.3]: https://github.com/MetaMask/snaps-monorepo/compare/v0.22.2...v0.22.3
[0.22.2]: https://github.com/MetaMask/snaps-monorepo/compare/v0.22.1...v0.22.2
[0.22.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.22.0...v0.22.1
[0.22.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.21.0...v0.22.0
[0.21.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.20.0...v0.21.0
[0.20.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.19.1...v0.20.0
[0.19.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.19.0...v0.19.1
[0.19.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.18.1...v0.19.0
[0.18.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.18.0...v0.18.1
[0.18.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.17.0...v0.18.0
[0.17.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.16.0...v0.17.0
[0.16.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.15.0...v0.16.0
[0.15.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.14.0...v0.15.0
[0.14.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.13.0...v0.14.0
[0.13.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.12.0...v0.13.0
[0.12.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.11.1...v0.12.0
[0.11.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.11.0...v0.11.1
[0.11.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.10.7...v0.11.0
[0.10.7]: https://github.com/MetaMask/snaps-monorepo/compare/v0.10.6...v0.10.7
[0.10.6]: https://github.com/MetaMask/snaps-monorepo/compare/v0.10.5...v0.10.6
[0.10.5]: https://github.com/MetaMask/snaps-monorepo/compare/v0.10.3...v0.10.5
[0.10.3]: https://github.com/MetaMask/snaps-monorepo/compare/v0.10.0...v0.10.3
[0.10.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.6.3...v0.7.0
[0.6.3]: https://github.com/MetaMask/snaps-monorepo/compare/v0.6.2...v0.6.3
[0.6.2]: https://github.com/MetaMask/snaps-monorepo/compare/v0.6.1...v0.6.2
[0.6.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.2.2...v0.3.0
[0.2.2]: https://github.com/MetaMask/snaps-monorepo/compare/v0.2.0...v0.2.2
[0.2.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/MetaMask/snaps-monorepo/releases/tag/v0.1.0
