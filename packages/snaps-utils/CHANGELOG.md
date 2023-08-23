# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.38.1-flask.1]
### Uncategorized
- Use depcheck to lint dependencies ([#1680](https://github.com/MetaMask/snaps-skunkworks.git/pull/1680))
- Remove unused deps ([#1674](https://github.com/MetaMask/snaps-skunkworks.git/pull/1674))
- Fix CLI usage of SWC ([#1677](https://github.com/MetaMask/snaps-skunkworks.git/pull/1677))
- Update transaction insight response and add severity level enum ([#1653](https://github.com/MetaMask/snaps-skunkworks.git/pull/1653))
- Update core libs ([#1673](https://github.com/MetaMask/snaps-skunkworks.git/pull/1673))
- deps: ses@0.18.1->0.18.7 ([#1666](https://github.com/MetaMask/snaps-skunkworks.git/pull/1666))

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

[Unreleased]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-utils@0.38.1-flask.1...HEAD
[0.38.1-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-utils@0.38.0-flask.1...@metamask/snaps-utils@0.38.1-flask.1
[0.38.0-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-utils@0.37.2-flask.1...@metamask/snaps-utils@0.38.0-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/releases/tag/@metamask/snaps-utils@0.37.2-flask.1
