# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.0.0]
### Uncategorized
- Add keyring export and endowment ([#1787](https://github.com/MetaMask/snaps-skunkworks.git/pull/1787))
- BREAKING: Bump minimum Node.js version to `^18.16.0` ([#1741](https://github.com/MetaMask/snaps-skunkworks.git/pull/1741))
- Bump @metamask/auto-changelog from 3.2.0 to 3.3.0 ([#1791](https://github.com/MetaMask/snaps-skunkworks.git/pull/1791))
- Bump @metamask/permission-controller from 4.1.1 to 4.1.2 ([#1794](https://github.com/MetaMask/snaps-skunkworks.git/pull/1794))
- Update LavaMoat ([#1754](https://github.com/MetaMask/snaps-skunkworks.git/pull/1754))

## [2.0.0]
### Changed
- Initial stable release from main branch ([#1757](https://github.com/MetaMask/snaps/pull/1757))

## [0.38.3-flask.1]
### Changed
- Bump `metamask/utils` and `metamask/snaps-registry` ([#1738](https://github.com/MetaMask/snaps/pull/1738))

## [0.38.2-flask.1]
### Changed
- Remove business-logic callbacks from `manageAccounts` ([#1725](https://github.com/MetaMask/snaps/pull/1725))
- Bump `@metamask/utils` and `@metamask/snaps-registry` ([#1694](https://github.com/MetaMask/snaps/pull/1694))

## [0.38.1-flask.1]
### Fixed
- Make `manageAccounts` arguments extend `RestrictedMethodParameters` ([#1687](https://github.com/MetaMask/snaps/pull/1687))

## [0.38.0-flask.1]
### Added
- Add `snap_getLocale` JSON-RPC method ([#1557](https://github.com/MetaMask/snaps/pull/1557))
   - This will let snaps get the user locale from the client.

### Fixed
- Fix ed25519 public key derivation ([#1678](https://github.com/MetaMask/snaps/pull/1678))

## [0.37.2-flask.1]
### Changed
- Release package independently ([#1600](https://github.com/MetaMask/snaps/pull/1600))
  - The version of the package no longer needs to match the version of all other
    MetaMask Snaps packages.

[Unreleased]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/rpc-methods@3.0.0...HEAD
[3.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/rpc-methods@2.0.0...@metamask/rpc-methods@3.0.0
[2.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/rpc-methods@0.38.3-flask.1...@metamask/rpc-methods@2.0.0
[0.38.3-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/rpc-methods@0.38.2-flask.1...@metamask/rpc-methods@0.38.3-flask.1
[0.38.2-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/rpc-methods@0.38.1-flask.1...@metamask/rpc-methods@0.38.2-flask.1
[0.38.1-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/rpc-methods@0.38.0-flask.1...@metamask/rpc-methods@0.38.1-flask.1
[0.38.0-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/rpc-methods@0.37.2-flask.1...@metamask/rpc-methods@0.38.0-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/releases/tag/@metamask/rpc-methods@0.37.2-flask.1
