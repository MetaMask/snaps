# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Uncategorized

- chore: Bump @lavamoat/allow-scripts from 3.4.0 to 3.4.1 ([#3744](https://github.com/MetaMask/snaps/pull/3744))
- chore: Bump @metamask/utils from 11.8.1 to 11.9.0 ([#3783](https://github.com/MetaMask/snaps/pull/3783))
- release: `137.0.0` ([#3780](https://github.com/MetaMask/snaps/pull/3780))
- release: `134.0.0` ([#3761](https://github.com/MetaMask/snaps/pull/3761))
- release: `131.0.0` ([#3730](https://github.com/MetaMask/snaps/pull/3730))
- chore: Bump @metamask/phishing-controller from 13.1.0 to 15.0.0 ([#3707](https://github.com/MetaMask/snaps/pull/3707))
- release: `126.0.0` ([#3662](https://github.com/MetaMask/snaps/pull/3662))
- chore: Bump @lavamoat/allow-scripts from 3.3.5 to 3.4.0 ([#3651](https://github.com/MetaMask/snaps/pull/3651))
- chore: Bump @metamask/utils from 11.7.0 to 11.8.1 ([#3648](https://github.com/MetaMask/snaps/pull/3648))
- chore: Bump @metamask/utils from 11.6.0 to 11.7.0 ([#3628](https://github.com/MetaMask/snaps/pull/3628))
- chore: Bump @metamask/utils from 11.4.2 to 11.5.0 ([#3623](https://github.com/MetaMask/snaps/pull/3623))
- chore: Bump @lavamoat/allow-scripts from 3.3.4 to 3.3.5 ([#3612](https://github.com/MetaMask/snaps/pull/3612))
- release: 120.0.0 ([#3543](https://github.com/MetaMask/snaps/pull/3543))
- release: `119.0.0` ([#3533](https://github.com/MetaMask/snaps/pull/3533))
- chore: Bump @metamask/utils from 11.4.1 to 11.4.2 ([#3526](https://github.com/MetaMask/snaps/pull/3526))
- release: `118.0.0` ([#3524](https://github.com/MetaMask/snaps/pull/3524))
- chore: Bump @metamask/utils from 11.4.0 to 11.4.1 ([#3516](https://github.com/MetaMask/snaps/pull/3516))
- release: `116.0.0` ([#3509](https://github.com/MetaMask/snaps/pull/3509))
- feat: Add `snap_trackError` method for error tracking through Sentry ([#3498](https://github.com/MetaMask/snaps/pull/3498))
- chore(dev-deps): Bump LavaMoat dependencies ([#3501](https://github.com/MetaMask/snaps/pull/3501))
- release: `114.0.0` ([#3463](https://github.com/MetaMask/snaps/pull/3463))
- release: `113.0.0` ([#3448](https://github.com/MetaMask/snaps/pull/3448))
- chore!: Drop support for Node.js 18 and 21 ([#3447](https://github.com/MetaMask/snaps/pull/3447))
- chore: Update TypeScript build target to ES2022 ([#3444](https://github.com/MetaMask/snaps/pull/3444))
- chore: Bump `@swc/core`, `@swc/jest`, and `swc-loader` to latest version ([#3442](https://github.com/MetaMask/snaps/pull/3442))
- release: `110.0.0` ([#3425](https://github.com/MetaMask/snaps/pull/3425))
- Release 109.0.0 ([#3412](https://github.com/MetaMask/snaps/pull/3412))
- release: 107.0.0 ([#3400](https://github.com/MetaMask/snaps/pull/3400))
- release: 104.0.0 ([#3384](https://github.com/MetaMask/snaps/pull/3384))
- chore(deps-dev): bump @lavamoat/allow-scripts from 3.0.4 to 3.3.3 ([#3378](https://github.com/MetaMask/snaps/pull/3378))
- chore!: Build Snaps execution environments with Webpack ([#3322](https://github.com/MetaMask/snaps/pull/3322))
- chore(deps-dev): bump @metamask/auto-changelog from 5.0.1 to 5.0.2 ([#3369](https://github.com/MetaMask/snaps/pull/3369))
- release: 103.0.0 ([#3360](https://github.com/MetaMask/snaps/pull/3360))
- chore(deps): bump @metamask/utils from 11.2.0 to 11.3.0 ([#3232](https://github.com/MetaMask/snaps/pull/3232))
- Release 99.0.0 ([#3309](https://github.com/MetaMask/snaps/pull/3309))
- chore(deps): bump @metamask/superstruct from 3.1.0 to 3.2.1 ([#3297](https://github.com/MetaMask/snaps/pull/3297))
- chore(deps-dev): bump @metamask/auto-changelog from 5.0.0 to 5.0.1 ([#3283](https://github.com/MetaMask/snaps/pull/3283))
- chore(deps-dev): bump @metamask/auto-changelog from 4.1.0 to 5.0.0 ([#3277](https://github.com/MetaMask/snaps/pull/3277))
- Release 98.0.0 ([#3269](https://github.com/MetaMask/snaps/pull/3269))
- Release 96.0.0 ([#3256](https://github.com/MetaMask/snaps/pull/3256))
- chore(deps): bump @metamask/key-tree from 10.1.0 to 10.1.1 ([#3254](https://github.com/MetaMask/snaps/pull/3254))
- perf!: Use mnemonic seed for state persistence key derivation ([#3217](https://github.com/MetaMask/snaps/pull/3217))
- chore(deps): bump @metamask/controller-utils from 11.5.0 to 11.6.0 ([#3204](https://github.com/MetaMask/snaps/pull/3204))

## [2.2.0]

### Added

- Add support for SIP-30 ([#3165](https://github.com/MetaMask/snaps/pull/3165))
  - The Snap now has a `getEntropySources` method that returns an array of
    entropy sources.
  - The existing methods now have an optional `source` parameter that can be
    used to specify the entropy source to use.

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

- Use `@metamask/snaps-sdk` package ([#1930](https://github.com/MetaMask/snaps/pull/1930),
  [#1946](https://github.com/MetaMask/snaps/pull/1946), [#1950](https://github.com/MetaMask/snaps/pull/1950),
  [#1949](https://github.com/MetaMask/snaps/pull/1949), [#1954](https://github.com/MetaMask/snaps/pull/1954))
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

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/bip44-example-snap@2.2.0...HEAD
[2.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/bip44-example-snap@2.1.3...@metamask/bip44-example-snap@2.2.0
[2.1.3]: https://github.com/MetaMask/snaps/compare/@metamask/bip44-example-snap@2.1.2...@metamask/bip44-example-snap@2.1.3
[2.1.2]: https://github.com/MetaMask/snaps/compare/@metamask/bip44-example-snap@2.1.1...@metamask/bip44-example-snap@2.1.2
[2.1.1]: https://github.com/MetaMask/snaps/compare/@metamask/bip44-example-snap@2.1.0...@metamask/bip44-example-snap@2.1.1
[2.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/bip44-example-snap@2.0.1...@metamask/bip44-example-snap@2.1.0
[2.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/bip44-example-snap@2.0.0...@metamask/bip44-example-snap@2.0.1
[2.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/bip44-example-snap@1.0.0...@metamask/bip44-example-snap@2.0.0
[1.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/bip44-example-snap@0.38.1-flask.1...@metamask/bip44-example-snap@1.0.0
[0.38.1-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/bip44-example-snap@0.38.0-flask.1...@metamask/bip44-example-snap@0.38.1-flask.1
[0.38.0-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/bip44-example-snap@0.37.2-flask.1...@metamask/bip44-example-snap@0.38.0-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps/releases/tag/@metamask/bip44-example-snap@0.37.2-flask.1
