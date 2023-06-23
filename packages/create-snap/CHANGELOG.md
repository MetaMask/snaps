# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.35.0-flask.1]
### Changed
- **BREAKING:** Build packages as both CJS and ESM ([#1519](https://github.com/MetaMask/snaps/pull/1519), ([#1532](https://github.com/MetaMask/snaps/pull/1532)))
  - This is breaking in the sense that imports to `dist/` will now require you to import either `dist/cjs` or `dist/esm`.
- Add `sideEffects: false` ([#1486](https://github.com/MetaMask/snaps/pull/1486))

## [0.34.1-flask.1]
### Changed
- No changes this release.

## [0.34.0-flask.1]
### Added
- Initial release ([#1268](https://github.com/MetaMask/snaps/pull/1268))

## [0.30.0]
### Changed
- No changes this release.

[Unreleased]: https://github.com/MetaMask/snaps/compare/v0.35.0-flask.1...HEAD
[0.35.0-flask.1]: https://github.com/MetaMask/snaps/compare/v0.34.1-flask.1...v0.35.0-flask.1
[0.34.1-flask.1]: https://github.com/MetaMask/snaps/compare/v0.34.0-flask.1...v0.34.1-flask.1
[0.34.0-flask.1]: https://github.com/MetaMask/snaps/compare/v0.30.0...v0.34.0-flask.1
[0.30.0]: https://github.com/MetaMask/snaps/releases/tag/v0.30.0
