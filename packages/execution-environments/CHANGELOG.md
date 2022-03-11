# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.10.1]
### Uncategorized
- @metamask/providers@8.1.1 ([#272](https://github.com/MetaMask/snaps-skunkworks/pull/272))
- Add missing publish command to execution-environments ([#271](https://github.com/MetaMask/snaps-skunkworks/pull/271))

## [0.10.0]
### Changed
- Initial release, made using components from the deprecated [`@metamask/snap-workers`](https://npmjs.com/package/@metamask/snap-workers) package. ([#231](https://github.com/MetaMask/snaps-skunkworks/pull/231))
  - Breaking changes are relative to the old package.
- **BREAKING:** Endowments must be passed to the execution environment ([#252](https://github.com/MetaMask/snaps-skunkworks/pull/252)), ([#266](https://github.com/MetaMask/snaps-skunkworks/pull/266))
  - Previously, default endowments were specified in the execution environment itself. Now, all endowments must be specified in the `executeSnap` RPC parameters, except for the `wallet` API object.
- Add endowments to the global `self` in addition to `window` ([#263](https://github.com/MetaMask/snaps-skunkworks/pull/263))

[Unreleased]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.10.1...HEAD
[0.10.1]: https://github.com/MetaMask/snaps-skunkworks/compare/v0.10.0...v0.10.1
[0.10.0]: https://github.com/MetaMask/snaps-skunkworks/releases/tag/v0.10.0
