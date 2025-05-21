# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Uncategorized

- release: 107.0.0 ([#3400](https://github.com/MetaMask/snaps-skunkworks.git/pull/3400))
- release: 104.0.0 ([#3384](https://github.com/MetaMask/snaps-skunkworks.git/pull/3384))
- chore(deps-dev): bump @lavamoat/allow-scripts from 3.0.4 to 3.3.3 ([#3378](https://github.com/MetaMask/snaps-skunkworks.git/pull/3378))
- chore(deps-dev): bump @metamask/auto-changelog from 5.0.1 to 5.0.2 ([#3369](https://github.com/MetaMask/snaps-skunkworks.git/pull/3369))
- release: 103.0.0 ([#3360](https://github.com/MetaMask/snaps-skunkworks.git/pull/3360))
- Release 99.0.0 ([#3309](https://github.com/MetaMask/snaps-skunkworks.git/pull/3309))
- chore(deps): bump @metamask/superstruct from 3.1.0 to 3.2.1 ([#3297](https://github.com/MetaMask/snaps-skunkworks.git/pull/3297))
- chore(deps-dev): bump @metamask/auto-changelog from 5.0.0 to 5.0.1 ([#3283](https://github.com/MetaMask/snaps-skunkworks.git/pull/3283))
- perf: Optimize `typedUnion` ([#3275](https://github.com/MetaMask/snaps-skunkworks.git/pull/3275))
- chore(deps-dev): bump @metamask/auto-changelog from 4.1.0 to 5.0.0 ([#3277](https://github.com/MetaMask/snaps-skunkworks.git/pull/3277))
- Release 98.0.0 ([#3269](https://github.com/MetaMask/snaps-skunkworks.git/pull/3269))
- Release 96.0.0 ([#3256](https://github.com/MetaMask/snaps-skunkworks.git/pull/3256))
- Release 91.0.0 ([#3185](https://github.com/MetaMask/snaps-skunkworks.git/pull/3185))
- Migrate to ESLint 9 ([#3118](https://github.com/MetaMask/snaps-skunkworks.git/pull/3118))
- Release 90.0.0 ([#3123](https://github.com/MetaMask/snaps-skunkworks.git/pull/3123))
- Release 88.0.0 ([#3061](https://github.com/MetaMask/snaps-skunkworks.git/pull/3061))
- Release 87.0.0 ([#3055](https://github.com/MetaMask/snaps-skunkworks.git/pull/3055))
- Release 85.0.0 ([#3038](https://github.com/MetaMask/snaps-skunkworks.git/pull/3038))

### Changed

- **BREAKING:** Remove background events methods in favor of new background events snap ([#3404](https://github.com/MetaMask/snaps/pull/3404))
  - When running e2e tests, the cronjobs interfere with background events so it becomes impossible to test

## [3.0.0]

### Added

- **BREAKING:** Add new method to cronjob example snap to test durations ([#3016](https://github.com/MetaMask/snaps/pull/3016))
  - The `scheduleNotification` RPC method was renamed to `scheduleNotificationWithDate`.

## [2.2.0]

### Added

- Add support for `snap_scheduleBackgroundEvent` ([#2941](https://github.com/MetaMask/snaps/pull/2941))

### Changed

- Bump MetaMask dependencies ([#2946](https://github.com/MetaMask/snaps/pull/2946), [#2989](https://github.com/MetaMask/snaps/pull/2989))

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

- Change cronjob interval to run more often ([#2164](https://github.com/MetaMask/snaps/pull/2164))

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

## [0.38.1-flask.1]

### Fixed

- Remove unused dependencies ([#1680](https://github.com/MetaMask/snaps/pull/1680))

## [0.38.0-flask.1]

### Changed

- Update example to the new configuration format ([#1632](https://github.com/MetaMask/snaps/pull/1632))
  - The example now uses Webpack instead of Browserify.

## [0.37.2-flask.1]

### Changed

- Release package independently ([#1600](https://github.com/MetaMask/snaps/pull/1600))
  - The version of the package no longer needs to match the version of all other
    MetaMask Snaps packages.

[Unreleased]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/cronjob-example-snap@3.0.0...HEAD
[3.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/cronjob-example-snap@2.2.0...@metamask/cronjob-example-snap@3.0.0
[2.2.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/cronjob-example-snap@2.1.4...@metamask/cronjob-example-snap@2.2.0
[2.1.4]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/cronjob-example-snap@2.1.3...@metamask/cronjob-example-snap@2.1.4
[2.1.3]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/cronjob-example-snap@2.1.2...@metamask/cronjob-example-snap@2.1.3
[2.1.2]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/cronjob-example-snap@2.1.1...@metamask/cronjob-example-snap@2.1.2
[2.1.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/cronjob-example-snap@2.1.0...@metamask/cronjob-example-snap@2.1.1
[2.1.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/cronjob-example-snap@2.0.1...@metamask/cronjob-example-snap@2.1.0
[2.0.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/cronjob-example-snap@2.0.0...@metamask/cronjob-example-snap@2.0.1
[2.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/cronjob-example-snap@1.0.0...@metamask/cronjob-example-snap@2.0.0
[1.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/cronjob-example-snap@0.38.1-flask.1...@metamask/cronjob-example-snap@1.0.0
[0.38.1-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/cronjob-example-snap@0.38.0-flask.1...@metamask/cronjob-example-snap@0.38.1-flask.1
[0.38.0-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/cronjob-example-snap@0.37.2-flask.1...@metamask/cronjob-example-snap@0.38.0-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/releases/tag/@metamask/cronjob-example-snap@0.37.2-flask.1
