# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.37.0-flask.1]
### Uncategorized
- Update GitHub link in snaps-simulator ([#1610](https://github.com/MetaMask/snaps/pull/1610))
- Bump @metamask/key-tree from 7.1.1 to 9.0.0 ([#1608](https://github.com/MetaMask/snaps/pull/1608))
- Use latest MetaMask `eslint` config ([#1606](https://github.com/MetaMask/snaps/pull/1606))
- Bump @metamask/eslint-config from 11.1.0 to 12.0.0 ([#1576](https://github.com/MetaMask/snaps/pull/1576))
- Fix Snaps Simulator post-tsc script ([#1589](https://github.com/MetaMask/snaps/pull/1589))

## [0.36.1-flask.1]
### Changed
- No changes this release.

## [0.36.0-flask.1]
### Changed
- No changes this release.

## [0.35.2-flask.1]
### Fixed
- Fix type issue introduced by [#1532](https://github.com/MetaMask/snaps/pull/1532) ([#1541](https://github.com/MetaMask/snaps/pull/1541))

## [0.35.1-flask.1]
### Fixed
- Fix publishing to NPM ([#1538](https://github.com/MetaMask/snaps/pull/1538))

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

[Unreleased]: https://github.com/MetaMask/snaps/compare/v0.37.0-flask.1...HEAD
[0.37.0-flask.1]: https://github.com/MetaMask/snaps/compare/v0.36.1-flask.1...v0.37.0-flask.1
[0.36.1-flask.1]: https://github.com/MetaMask/snaps/compare/v0.36.0-flask.1...v0.36.1-flask.1
[0.36.0-flask.1]: https://github.com/MetaMask/snaps/compare/v0.35.2-flask.1...v0.36.0-flask.1
[0.35.2-flask.1]: https://github.com/MetaMask/snaps/compare/v0.35.1-flask.1...v0.35.2-flask.1
[0.35.1-flask.1]: https://github.com/MetaMask/snaps/compare/v0.35.0-flask.1...v0.35.1-flask.1
[0.35.0-flask.1]: https://github.com/MetaMask/snaps/compare/v0.34.1-flask.1...v0.35.0-flask.1
[0.34.1-flask.1]: https://github.com/MetaMask/snaps/compare/v0.34.0-flask.1...v0.34.1-flask.1
[0.34.0-flask.1]: https://github.com/MetaMask/snaps/releases/tag/v0.34.0-flask.1
