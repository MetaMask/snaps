# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0]
### Changed
- Initial stable release from main branch ([#1757](https://github.com/MetaMask/snaps/pull/1757))

## [0.38.3-flask.1]
### Added
- Add `onNameLookup` types ([#1759](https://github.com/MetaMask/snaps/pull/1759))

### Changed
- Bump `metamask/utils` and `metamask/snaps-registry` ([#1738](https://github.com/MetaMask/snaps/pull/1738), [#1694](https://github.com/MetaMask/snaps/pull/1694))

## [0.38.2-flask.1]
### Fixed
- Remove unused dependencies ([#1680](https://github.com/MetaMask/snaps/pull/1680))

## [0.38.1-flask.1]
### Changed
- Update transaction insights response and add severity level enum ([#1653](https://github.com/MetaMask/snaps/pull/1653))
   - Snaps are now able to specify a `severity` alongside their insights.
   - See [SIP-11](https://metamask.github.io/SIPs/SIPS/sip-11) for more information.

## [0.38.0-flask.1]
### Added
- Add `onInstall` and `onUpdate` lifecycle hooks ([#1643](https://github.com/MetaMask/snaps/pull/1643))
  - This package now exports the `OnInstallHandler` and `OnUpdateHandler` types.

## [0.37.2-flask.1]
### Changed
- Release package independently ([#1600](https://github.com/MetaMask/snaps/pull/1600))
  - The version of the package no longer needs to match the version of all other
    MetaMask Snaps packages.

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-types@2.0.0...HEAD
[2.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-types@0.38.3-flask.1...@metamask/snaps-types@2.0.0
[0.38.3-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-types@0.38.2-flask.1...@metamask/snaps-types@0.38.3-flask.1
[0.38.2-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-types@0.38.1-flask.1...@metamask/snaps-types@0.38.2-flask.1
[0.38.1-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-types@0.38.0-flask.1...@metamask/snaps-types@0.38.1-flask.1
[0.38.0-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-types@0.37.2-flask.1...@metamask/snaps-types@0.38.0-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps/releases/tag/@metamask/snaps-types@0.37.2-flask.1
