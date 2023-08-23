# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/rpc-methods@0.38.0-flask.1...HEAD
[0.38.0-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/rpc-methods@0.37.2-flask.1...@metamask/rpc-methods@0.38.0-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps/releases/tag/@metamask/rpc-methods@0.37.2-flask.1
