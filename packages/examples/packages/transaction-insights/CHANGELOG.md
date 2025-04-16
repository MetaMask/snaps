# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Uncategorized

- Release 99.0.0 ([#3309](https://github.com/MetaMask/snaps/pull/3309))
- chore(deps): bump @metamask/superstruct from 3.1.0 to 3.2.1 ([#3297](https://github.com/MetaMask/snaps/pull/3297))
- chore(deps-dev): bump @metamask/auto-changelog from 5.0.0 to 5.0.1 ([#3283](https://github.com/MetaMask/snaps/pull/3283))
- perf: Optimize `typedUnion` ([#3275](https://github.com/MetaMask/snaps/pull/3275))
- chore(deps-dev): bump @metamask/auto-changelog from 4.1.0 to 5.0.0 ([#3277](https://github.com/MetaMask/snaps/pull/3277))
- Release 98.0.0 ([#3269](https://github.com/MetaMask/snaps/pull/3269))
- Release 96.0.0 ([#3256](https://github.com/MetaMask/snaps/pull/3256))
- Release 91.0.0 ([#3185](https://github.com/MetaMask/snaps/pull/3185))
- Migrate to ESLint 9 ([#3118](https://github.com/MetaMask/snaps/pull/3118))
- Release 90.0.0 ([#3123](https://github.com/MetaMask/snaps/pull/3123))
- chore(deps): bump @metamask/utils from 11.1.0 to 11.2.0 ([#3091](https://github.com/MetaMask/snaps/pull/3091))
- chore(deps): bump @metamask/utils from 11.0.1 to 11.1.0 ([#3050](https://github.com/MetaMask/snaps/pull/3050))
- Release 88.0.0 ([#3061](https://github.com/MetaMask/snaps/pull/3061))
- Release 87.0.0 ([#3055](https://github.com/MetaMask/snaps/pull/3055))
- Release 85.0.0 ([#3038](https://github.com/MetaMask/snaps/pull/3038))
- Release 82.0.0 ([#3012](https://github.com/MetaMask/snaps/pull/3012))
- Bump MetaMask dependencies ([#2946](https://github.com/MetaMask/snaps/pull/2946))
- Release 81.0.0 ([#2964](https://github.com/MetaMask/snaps/pull/2964))
- feat: Automatically add `platformVersion` to manifest ([#2938](https://github.com/MetaMask/snaps/pull/2938))
- feat: Allow async initialization logic ([#2918](https://github.com/MetaMask/snaps/pull/2918))
- chore: Bump MetaMask dependencies ([#2853](https://github.com/MetaMask/snaps/pull/2853))
- Add TypeScript typechecking to snaps-cli ([#2783](https://github.com/MetaMask/snaps/pull/2783))
- Update Yarn constraints to use JavaScript-based constraints ([#2740](https://github.com/MetaMask/snaps/pull/2740))
- Update metadata for all packages ([#2748](https://github.com/MetaMask/snaps/pull/2748))
- Add `since-latest-release` script to match `MetaMask/core` ([#2744](https://github.com/MetaMask/snaps/pull/2744))
- Update test scripts to match `MetaMask/core` ([#2745](https://github.com/MetaMask/snaps/pull/2745))
- Fix linting of `package.json` files ([#2742](https://github.com/MetaMask/snaps/pull/2742))
- Update changelog validation scripts to match `MetaMask/core` ([#2741](https://github.com/MetaMask/snaps/pull/2741))

## [2.2.3]

### Fixed

- Bump MetaMask dependencies

## [2.2.2]

### Fixed

- Fix address validation in row component ([#2257](https://github.com/MetaMask/snaps/pull/2257))

## [2.2.1]

### Changed

- Remove snap icon ([#2189](https://github.com/MetaMask/snaps/pull/2189))

## [2.2.0]

### Added

- Use new `row` and `address` component ([#1968](https://github.com/MetaMask/snaps/pull/1968))

## [2.1.0]

### Changed

- Use `@metamask/snaps-sdk` package ([#1930](https://github.com/MetaMask/snaps/pull/1930),
  [#1946](https://github.com/MetaMask/snaps/pull/1946), [#1950](https://github.com/MetaMask/snaps/pull/1950),
  [#1949](https://github.com/MetaMask/snaps/pull/1949), [#1954](https://github.com/MetaMask/snaps/pull/1954))
  - This package replaces the `@metamask/snaps-types` and
  - `@metamask/snaps-ui` packages, and is much more lightweight.

## [2.0.2]

### Changed

- Update example insight snap to support transaction insights v2 ([#1911](https://github.com/MetaMask/snaps/pull/1911))

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

### Changed

- Use `polyfills` option for specifying Node.js polyfills ([#1650](https://github.com/MetaMask/snaps/pull/1650))

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

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/insights-example-snap@2.2.3...HEAD
[2.2.3]: https://github.com/MetaMask/snaps/compare/@metamask/insights-example-snap@2.2.2...@metamask/insights-example-snap@2.2.3
[2.2.2]: https://github.com/MetaMask/snaps/compare/@metamask/insights-example-snap@2.2.1...@metamask/insights-example-snap@2.2.2
[2.2.1]: https://github.com/MetaMask/snaps/compare/@metamask/insights-example-snap@2.2.0...@metamask/insights-example-snap@2.2.1
[2.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/insights-example-snap@2.1.0...@metamask/insights-example-snap@2.2.0
[2.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/insights-example-snap@2.0.2...@metamask/insights-example-snap@2.1.0
[2.0.2]: https://github.com/MetaMask/snaps/compare/@metamask/insights-example-snap@2.0.1...@metamask/insights-example-snap@2.0.2
[2.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/insights-example-snap@2.0.0...@metamask/insights-example-snap@2.0.1
[2.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/insights-example-snap@1.0.0...@metamask/insights-example-snap@2.0.0
[1.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/insights-example-snap@0.38.1-flask.1...@metamask/insights-example-snap@1.0.0
[0.38.1-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/insights-example-snap@0.38.0-flask.1...@metamask/insights-example-snap@0.38.1-flask.1
[0.38.0-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/insights-example-snap@0.37.2-flask.1...@metamask/insights-example-snap@0.38.0-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps/releases/tag/@metamask/insights-example-snap@0.37.2-flask.1
