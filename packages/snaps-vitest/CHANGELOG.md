# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Add a Vitest environment that starts the built-in Snap server and exposes
  `installSnap()` ([#4175](https://github.com/MetaMask/snaps/pull/4175)).
- Add the Snaps matchers (`toRespondWith`, `toRespondWithError`,
  `toSendNotification`, `toRender`, `toTrackError`, `toTrackEvent`, and
  `toTrace`) ([#4175](https://github.com/MetaMask/snaps/pull/4175)).
- Add the `installSnap`, `getMockAccount`, `getStateFromAccount`, and
  `getStateFromAsset` helpers ([#4175](https://github.com/MetaMask/snaps/pull/4175)).
- Add the `snapsVitestPreset` and `getSnapsVitestConfig` configuration helpers ([#4175](https://github.com/MetaMask/snaps/pull/4175)).

[Unreleased]: https://github.com/MetaMask/snaps/
