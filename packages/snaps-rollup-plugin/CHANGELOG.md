# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [5.0.0]

### Added

- Support scheduling cronjobs with an ISO 8601 duration ([#3421](https://github.com/MetaMask/snaps/pull/3421))

### Changed

- **BREAKING:** Drop support for Node.js 18 and 21 ([#3447](https://github.com/MetaMask/snaps/pull/3447))

## [4.2.0]

### Added

- Automatically add `platformVersion` to manifest ([#2938](https://github.com/MetaMask/snaps/pull/2938))

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

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rollup-plugin@5.0.0...HEAD
[5.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rollup-plugin@4.2.0...@metamask/snaps-rollup-plugin@5.0.0
[4.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rollup-plugin@4.1.2...@metamask/snaps-rollup-plugin@4.2.0
[4.1.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rollup-plugin@4.1.1...@metamask/snaps-rollup-plugin@4.1.2
[4.1.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rollup-plugin@4.1.0...@metamask/snaps-rollup-plugin@4.1.1
[4.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rollup-plugin@4.0.1...@metamask/snaps-rollup-plugin@4.1.0
[4.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rollup-plugin@4.0.0...@metamask/snaps-rollup-plugin@4.0.1
[4.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rollup-plugin@3.0.2...@metamask/snaps-rollup-plugin@4.0.0
[3.0.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rollup-plugin@3.0.1...@metamask/snaps-rollup-plugin@3.0.2
[3.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rollup-plugin@3.0.0...@metamask/snaps-rollup-plugin@3.0.1
[3.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rollup-plugin@2.0.0...@metamask/snaps-rollup-plugin@3.0.0
[2.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rollup-plugin@0.37.3-flask.1...@metamask/snaps-rollup-plugin@2.0.0
[0.37.3-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rollup-plugin@0.37.2-flask.1...@metamask/snaps-rollup-plugin@0.37.3-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps/releases/tag/@metamask/snaps-rollup-plugin@0.37.2-flask.1
