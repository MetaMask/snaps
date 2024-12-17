# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [4.2.0]

### Uncategorized

- chore: Bump ts-bridge ([#2917](https://github.com/MetaMask/snaps-skunkworks.git/pull/2917))
- Bump `ts-bridge` to `0.6.0` ([#2882](https://github.com/MetaMask/snaps-skunkworks.git/pull/2882))
- Update Yarn constraints to use JavaScript-based constraints ([#2740](https://github.com/MetaMask/snaps-skunkworks.git/pull/2740))
- Update metadata for all packages ([#2748](https://github.com/MetaMask/snaps-skunkworks.git/pull/2748))
- Add missing license fields ([#2747](https://github.com/MetaMask/snaps-skunkworks.git/pull/2747))
- Add `since-latest-release` script to match `MetaMask/core` ([#2744](https://github.com/MetaMask/snaps-skunkworks.git/pull/2744))
- Update test scripts to match `MetaMask/core` ([#2745](https://github.com/MetaMask/snaps-skunkworks.git/pull/2745))
- Fix linting of `package.json` files ([#2742](https://github.com/MetaMask/snaps-skunkworks.git/pull/2742))
- Update changelog validation scripts to match `MetaMask/core` ([#2741](https://github.com/MetaMask/snaps-skunkworks.git/pull/2741))

## [4.1.2]

### Fixed

- Fix invalid types in type declaration in some cases ([#2714](https://github.com/MetaMask/snaps/pull/2714))

## [4.1.1]

### Fixed

- Fix ESM version of the package ([#2682](https://github.com/MetaMask/snaps/pull/2682))
  - This fixes the ESM version of the package to be fully compliant with the ESM
    standard.

## [4.1.0]

### Changed

- Improve manifest validation output ([#2572](https://github.com/MetaMask/snaps/pull/2572))

## [4.0.1]

### Fixed

- Fix minor build configuration problems ([#2220](https://github.com/MetaMask/snaps/pull/2220))

## [4.0.0]

### Changed

- **BREAKING:** Update ESM build to be fully compliant with the ESM standard ([#2210](https://github.com/MetaMask/snaps/pull/2210))

## [3.0.2]

### Changed

- Bump several MetaMask dependencies ([#2054](https://github.com/MetaMask/snaps/pull/2054), [#2100](https://github.com/MetaMask/snaps/pull/2100), [#2105](https://github.com/MetaMask/snaps/pull/2105), [#2173](https://github.com/MetaMask/snaps/pull/2173))

## [3.0.1]

### Changed

- Update multiple MetaMask dependencies ([#1841](https://github.com/MetaMask/snaps/pull/1841))

## [3.0.0]

### Changed

- **BREAKING:** Bump minimum Node.js version to `^18.16.0` ([#1741](https://github.com/MetaMask/snaps/pull/1741))

## [2.0.0]

### Changed

- Initial stable release from main branch ([#1757](https://github.com/MetaMask/snaps/pull/1757))

## [0.37.3-flask.1]

### Fixed

- Remove unused dependencies ([#1680](https://github.com/MetaMask/snaps/pull/1680))

## [0.37.2-flask.1]

### Changed

- Release package independently ([#1600](https://github.com/MetaMask/snaps/pull/1600))
  - The version of the package no longer needs to match the version of all other
    MetaMask Snaps packages.

[Unreleased]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rollup-plugin@4.2.0...HEAD
[4.2.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rollup-plugin@4.1.2...@metamask/snaps-rollup-plugin@4.2.0
[4.1.2]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rollup-plugin@4.1.1...@metamask/snaps-rollup-plugin@4.1.2
[4.1.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rollup-plugin@4.1.0...@metamask/snaps-rollup-plugin@4.1.1
[4.1.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rollup-plugin@4.0.1...@metamask/snaps-rollup-plugin@4.1.0
[4.0.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rollup-plugin@4.0.0...@metamask/snaps-rollup-plugin@4.0.1
[4.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rollup-plugin@3.0.2...@metamask/snaps-rollup-plugin@4.0.0
[3.0.2]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rollup-plugin@3.0.1...@metamask/snaps-rollup-plugin@3.0.2
[3.0.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rollup-plugin@3.0.0...@metamask/snaps-rollup-plugin@3.0.1
[3.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rollup-plugin@2.0.0...@metamask/snaps-rollup-plugin@3.0.0
[2.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rollup-plugin@0.37.3-flask.1...@metamask/snaps-rollup-plugin@2.0.0
[0.37.3-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-rollup-plugin@0.37.2-flask.1...@metamask/snaps-rollup-plugin@0.37.3-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/releases/tag/@metamask/snaps-rollup-plugin@0.37.2-flask.1
