# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.1]
### Uncategorized
- Improve error handling ([#1841](https://github.com/MetaMask/snaps-skunkworks.git/pull/1841))
- Publish preview builds to public NPM registry ([#1873](https://github.com/MetaMask/snaps-skunkworks.git/pull/1873))
- Bump `depcheck` ([#1868](https://github.com/MetaMask/snaps-skunkworks.git/pull/1868))

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
### Added
- Add example JSON-RPC method using `personal_sign` ([#1601](https://github.com/MetaMask/snaps/pull/1601))

### Changed
- Update example to the new configuration format ([#1632](https://github.com/MetaMask/snaps/pull/1632))
  - The example now uses Webpack instead of Browserify.

## [0.37.2-flask.1]
### Changed
- Release package independently ([#1600](https://github.com/MetaMask/snaps/pull/1600))
  - The version of the package no longer needs to match the version of all other
    MetaMask Snaps packages.

[Unreleased]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/ethereum-provider-example-snap@2.0.1...HEAD
[2.0.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/ethereum-provider-example-snap@2.0.0...@metamask/ethereum-provider-example-snap@2.0.1
[2.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/ethereum-provider-example-snap@1.0.0...@metamask/ethereum-provider-example-snap@2.0.0
[1.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/ethereum-provider-example-snap@0.38.1-flask.1...@metamask/ethereum-provider-example-snap@1.0.0
[0.38.1-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/ethereum-provider-example-snap@0.38.0-flask.1...@metamask/ethereum-provider-example-snap@0.38.1-flask.1
[0.38.0-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/ethereum-provider-example-snap@0.37.2-flask.1...@metamask/ethereum-provider-example-snap@0.38.0-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/releases/tag/@metamask/ethereum-provider-example-snap@0.37.2-flask.1
