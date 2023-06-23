# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.35.1-flask.1]
### Uncategorized
- Add missing `publishConfig` to `snaps-jest` and `snaps-simulator` ([#1538](https://github.com/MetaMask/snaps/pull/1538))

## [0.35.0-flask.1]
### Added
- Add dark mode ([#1453](https://github.com/MetaMask/snaps/pull/1453))

### Changed
- **BREAKING:** Build packages as both CJS and ESM ([#1519](https://github.com/MetaMask/snaps/pull/1519), ([#1532](https://github.com/MetaMask/snaps/pull/1532)))
  - This is breaking in the sense that imports to `dist/` will now require you to import either `dist/cjs` or `dist/esm`.
- Add `sideEffects: false` ([#1486](https://github.com/MetaMask/snaps/pull/1486))
- Add support for E2E testing mode, to be used by `@metamask/snaps-jest` ([#1438](https://github.com/MetaMask/snaps/pull/1438), [#1488](https://github.com/MetaMask/snaps/pull/1488))

### Fixed
- Fix response typing in `snaps-simulator` ([#1498](https://github.com/MetaMask/snaps/pull/1498))
- Fix `snap_manageState` in `snaps-simulator` ([#1494](https://github.com/MetaMask/snaps/pull/1494))

## [0.34.1-flask.1]
### Changed
- No changes this release.

## [0.34.0-flask.1]
### Added
- Migrate `snaps-simulator` to `snaps-monorepo` ([#1408](https://github.com/MetaMask/snaps/pull/1408), [#1418](https://github.com/MetaMask/snaps/pull/1418))

[Unreleased]: https://github.com/MetaMask/snaps/compare/v0.35.1-flask.1...HEAD
[0.35.1-flask.1]: https://github.com/MetaMask/snaps/compare/v0.35.0-flask.1...v0.35.1-flask.1
[0.35.0-flask.1]: https://github.com/MetaMask/snaps/compare/v0.34.1-flask.1...v0.35.0-flask.1
[0.34.1-flask.1]: https://github.com/MetaMask/snaps/compare/v0.34.0-flask.1...v0.34.1-flask.1
[0.34.0-flask.1]: https://github.com/MetaMask/snaps/releases/tag/v0.34.0-flask.1
