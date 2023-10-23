# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.1.0]
### Uncategorized
- Improve error handling ([#1841](https://github.com/MetaMask/snaps-skunkworks.git/pull/1841))
- Publish preview builds to public NPM registry ([#1873](https://github.com/MetaMask/snaps-skunkworks.git/pull/1873))
- Bump `depcheck` ([#1868](https://github.com/MetaMask/snaps-skunkworks.git/pull/1868))
- Bump WebdriverIO ([#1863](https://github.com/MetaMask/snaps-skunkworks.git/pull/1863))
- Bump Babel ([#1862](https://github.com/MetaMask/snaps-skunkworks.git/pull/1862))
- Support `utf8` encoding for `snap_getFile` ([#1858](https://github.com/MetaMask/snaps-skunkworks.git/pull/1858))
- Add static file API ([#1836](https://github.com/MetaMask/snaps-skunkworks.git/pull/1836))
- Bump @metamask/snaps-registry from 2.0.0 to 2.1.0 ([#1846](https://github.com/MetaMask/snaps-skunkworks.git/pull/1846))
- Tweak WDIO config ([#1840](https://github.com/MetaMask/snaps-skunkworks.git/pull/1840))
- Refactor snap fetching slightly ([#1834](https://github.com/MetaMask/snaps-skunkworks.git/pull/1834))
- Standardise all errors thrown in execution environments ([#1830](https://github.com/MetaMask/snaps-skunkworks.git/pull/1830))

## [3.0.0]
### Added
- Add keyring export and endowment ([#1787](https://github.com/MetaMask/snaps/pull/1787))
- Add optional `allowedOrigins` field to `endowment:rpc` ([#1822](https://github.com/MetaMask/snaps/pull/1822))
  - This can be used to only accept certain origins in your Snap.

### Changed
- **BREAKING:** Bump minimum Node.js version to `^18.16.0` ([#1741](https://github.com/MetaMask/snaps/pull/1741))

## [2.0.1]
### Changed
- Remove deprecated `endowment:long-running` ([#1751](https://github.com/MetaMask/snaps/pull/1751))

## [2.0.0]
### Changed
- Initial stable release from main branch ([#1757](https://github.com/MetaMask/snaps/pull/1757))

## [0.38.4-flask.1]
### Added
- Add `onNameLookup` export ([#1394](https://github.com/MetaMask/snaps/pull/1394), [#1759](https://github.com/MetaMask/snaps/pull/1759))

### Changed
- Bump `metamask/utils` and `metamask/snaps-registry` ([#1738](https://github.com/MetaMask/snaps/pull/1738))

## [0.38.3-flask.1]
### Changed
- Bump `@metamask/post-message-stream` from 6.1.2 to 7.0.0 ([#1707](https://github.com/MetaMask/snaps/pull/1707), [#1724](https://github.com/MetaMask/snaps/pull/1724))
- Bump `@metamask/utils` and `@metamask/snaps-registry` ([#1694](https://github.com/MetaMask/snaps/pull/1694))

## [0.38.2-flask.1]
### Fixed
- Remove unused dependencies ([#1680](https://github.com/MetaMask/snaps/pull/1680))

## [0.38.1-flask.1]
### Changed
- Update transaction insights response and add severity level enum ([#1653](https://github.com/MetaMask/snaps/pull/1653))
   - Snaps are now able to specify a `severity` for alongside their insights.
   - See [SIP-11](https://metamask.github.io/SIPs/SIPS/sip-11) for more information.

## [0.38.0-flask.1]
### Added
- Add `onInstall` and `onUpdate` lifecycle hooks ([#1643](https://github.com/MetaMask/snaps/pull/1643))

### Changed
- Move source code and snap state back to controller state ([#1634](https://github.com/MetaMask/snaps/pull/1634))
- Bump `semver` to `^7.5.4` ([#1631](https://github.com/MetaMask/snaps/pull/1631))

## [0.37.2-flask.1]
### Changed
- Release package independently ([#1600](https://github.com/MetaMask/snaps/pull/1600))
  - The version of the package no longer needs to match the version of all other
    MetaMask Snaps packages.

[Unreleased]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-utils@3.1.0...HEAD
[3.1.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-utils@3.0.0...@metamask/snaps-utils@3.1.0
[3.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-utils@2.0.1...@metamask/snaps-utils@3.0.0
[2.0.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-utils@2.0.0...@metamask/snaps-utils@2.0.1
[2.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-utils@0.38.4-flask.1...@metamask/snaps-utils@2.0.0
[0.38.4-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-utils@0.38.3-flask.1...@metamask/snaps-utils@0.38.4-flask.1
[0.38.3-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-utils@0.38.2-flask.1...@metamask/snaps-utils@0.38.3-flask.1
[0.38.2-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-utils@0.38.1-flask.1...@metamask/snaps-utils@0.38.2-flask.1
[0.38.1-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-utils@0.38.0-flask.1...@metamask/snaps-utils@0.38.1-flask.1
[0.38.0-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-utils@0.37.2-flask.1...@metamask/snaps-utils@0.38.0-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/releases/tag/@metamask/snaps-utils@0.37.2-flask.1
