# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Uncategorized

- Migrate to ESLint 9 ([#3118](https://github.com/MetaMask/snaps/pull/3118))
- chore: Bump ts-bridge ([#2917](https://github.com/MetaMask/snaps/pull/2917))
- Bump `ts-bridge` to `0.6.0` ([#2882](https://github.com/MetaMask/snaps/pull/2882))
- Update Yarn constraints to use JavaScript-based constraints ([#2740](https://github.com/MetaMask/snaps/pull/2740))
- Update metadata for all packages ([#2748](https://github.com/MetaMask/snaps/pull/2748))
- Add `since-latest-release` script to match `MetaMask/core` ([#2744](https://github.com/MetaMask/snaps/pull/2744))
- Update test scripts to match `MetaMask/core` ([#2745](https://github.com/MetaMask/snaps/pull/2745))
- Fix linting of `package.json` files ([#2742](https://github.com/MetaMask/snaps/pull/2742))
- Update changelog validation scripts to match `MetaMask/core` ([#2741](https://github.com/MetaMask/snaps/pull/2741))

## [4.0.4]

### Fixed

- Fix invalid types in type declaration in some cases ([#2714](https://github.com/MetaMask/snaps/pull/2714))

## [4.0.3]

### Fixed

- Fix ESM version of the package ([#2682](https://github.com/MetaMask/snaps/pull/2682))
  - This fixes the ESM version of the package to be fully compliant with the ESM
    standard.

## [4.0.2]

### Fixed

- Fix detection of minimum Node.js version ([#2292](https://github.com/MetaMask/snaps/pull/2292))

## [4.0.1]

### Fixed

- Fix minor build configuration problems ([#2220](https://github.com/MetaMask/snaps/pull/2220))

## [4.0.0]

### Changed

- **BREAKING:** Update ESM build to be fully compliant with the ESM standard ([#2210](https://github.com/MetaMask/snaps/pull/2210))

## [3.1.1]

### Changed

- Bump several MetaMask dependencies ([#1964](https://github.com/MetaMask/snaps/pull/1964))

## [3.1.0]

### Added

- Create an initial commit when creating a Snap from the template ([#1917](https://github.com/MetaMask/snaps/pull/1917))

### Fixed

- Handle unhandled errors ([#1916](https://github.com/MetaMask/snaps/pull/1916))

## [3.0.1]

### Changed

- Update multiple MetaMask dependencies ([#1841](https://github.com/MetaMask/snaps/pull/1841))

## [3.0.0]

### Changed

- **BREAKING:** Bump minimum Node.js version to `^18.16.0` ([#1741](https://github.com/MetaMask/snaps/pull/1741))

## [2.0.0]

### Changed

- **BREAKING:** Bump minimum Node.js version to `18.6.0` ([#1789](https://github.com/MetaMask/snaps/pull/1789))

## [1.0.1]

### Fixed

- Fix shell command injection ([#1784](https://github.com/MetaMask/snaps/pull/1784))

## [1.0.0]

### Changed

- Initial stable release from main branch ([#1757](https://github.com/MetaMask/snaps/pull/1757))

## [0.37.4-flask.1]

### Changed

- Bump `metamask/utils` and `metamask/snaps-registry` ([#1738](https://github.com/MetaMask/snaps/pull/1738), [#1694](https://github.com/MetaMask/snaps/pull/1694))

## [0.37.3-flask.1]

### Changed

- Remove unused dependencies ([#1674](https://github.com/MetaMask/snaps/pull/1674))

## [0.37.2-flask.1]

### Changed

- Release package independently ([#1600](https://github.com/MetaMask/snaps/pull/1600))
  - The version of the package no longer needs to match the version of all other
    MetaMask Snaps packages.

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/create-snap@4.0.4...HEAD
[4.0.4]: https://github.com/MetaMask/snaps/compare/@metamask/create-snap@4.0.3...@metamask/create-snap@4.0.4
[4.0.3]: https://github.com/MetaMask/snaps/compare/@metamask/create-snap@4.0.2...@metamask/create-snap@4.0.3
[4.0.2]: https://github.com/MetaMask/snaps/compare/@metamask/create-snap@4.0.1...@metamask/create-snap@4.0.2
[4.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/create-snap@4.0.0...@metamask/create-snap@4.0.1
[4.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/create-snap@3.1.1...@metamask/create-snap@4.0.0
[3.1.1]: https://github.com/MetaMask/snaps/compare/@metamask/create-snap@3.1.0...@metamask/create-snap@3.1.1
[3.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/create-snap@3.0.1...@metamask/create-snap@3.1.0
[3.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/create-snap@3.0.0...@metamask/create-snap@3.0.1
[3.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/create-snap@2.0.0...@metamask/create-snap@3.0.0
[2.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/create-snap@1.0.1...@metamask/create-snap@2.0.0
[1.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/create-snap@1.0.0...@metamask/create-snap@1.0.1
[1.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/create-snap@0.37.4-flask.1...@metamask/create-snap@1.0.0
[0.37.4-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/create-snap@0.37.3-flask.1...@metamask/create-snap@0.37.4-flask.1
[0.37.3-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/create-snap@0.37.2-flask.1...@metamask/create-snap@0.37.3-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps/releases/tag/@metamask/create-snap@0.37.2-flask.1
