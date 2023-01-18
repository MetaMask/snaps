# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.28.0]
### Changed
- **BREAKING:** Bump `key-tree` to `6.2.0` and use `Uint8Array` for secret recovery phrases ([#1137](https://github.com/MetaMask/snaps-monorepo/pull/1137))

## [0.27.1]
### Fixed
- Fix `snap_manageState` with empty state ([#1083](https://github.com/MetaMask/snaps-monorepo/pull/1083))
- Fix `snap_manageState` method hooks ([#1080](https://github.com/MetaMask/snaps-monorepo/pull/1080))

## [0.27.0]
### Changed
- **BREAKING:** Use custom UI in `snap_dialog` ([#1051](https://github.com/MetaMask/snaps-monorepo/pull/1051))
- **BREAKING:** Use SIP-6 algorithm for state encryption ([#1055](https://github.com/MetaMask/snaps-monorepo/pull/1055))
  - This breaks all existing snaps that use `snap_manageState`

## [0.26.2]
### Changed
- No changes this release.

## [0.26.1]
### Changed
- No changes this release.

## [0.26.0]
### Changed
- No changes this release.

## [0.25.0]
### Added
- Add placeholder parameter for prompt dialog ([#1007](https://github.com/MetaMask/snaps-monorepo/pull/1007))

## [0.24.1]
### Fixed
- Fix `snap_getBip32PublicKey` manifest validation ([#970](https://github.com/MetaMask/snaps-monorepo/pull/970))

## [0.24.0]
### Added
- Add `snap_getEntropy` JSON-RPC method ([#940](https://github.com/MetaMask/snaps-monorepo/pull/940))
- Add permission validation to `snap.manifest.json` ([#910](https://github.com/MetaMask/snaps-monorepo/pull/910))

### Changed
- **BREAKING:** Remove `wallet_enable` and `wallet_installSnaps` in favor of `wallet_requestSnaps` ([#909](https://github.com/MetaMask/snaps-monorepo/pull/909))
- **BREAKING:** Refactor RPC method params and add tests ([#922](https://github.com/MetaMask/snaps-monorepo/pull/922))

### Removed
- **BREAKING:** Remove `snap_getAppKey` ([#867](https://github.com/MetaMask/snaps-monorepo/pull/867))

## [0.23.0]
### Changed
- **BREAKING:** Bump `@metamask/key-tree` to 6.0.0 ([#918](https://github.com/MetaMask/snaps-monorepo/pull/918))
  - All hexadecimal values are now prefixed with `0x`
  - The package no longer uses `Buffer`. Because of that some fields have been renamed.

## [0.22.3]
### Changed
- No changes this release.

## [0.22.2]
### Added
- Add JSON-RPC validation for Snap RPC requests ([#833](https://github.com/MetaMask/snaps-monorepo/pull/833))

## [0.22.1]
### Changed
- No changes this release.

## [0.22.0]
### Added
- Add `snap_dialog` method and deprecate `snap_confirm` ([#799](https://github.com/MetaMask/snaps-monorepo/pull/799))

## [0.21.0]
### Added
- Add `snap_getBip32PublicKey` RPC method ([#729](https://github.com/MetaMask/snaps-monorepo/pull/729))

### Changed
- Expose master fingerprints on BIP-32 and SLIP-10 nodes ([#773](https://github.com/MetaMask/snaps-monorepo/pull/773))
  - Accomplished by bumping `@metamask/key-tree` to `5.0.2`
- Allow deriving child nodes with `getBip32Entropy` ([#751](https://github.com/MetaMask/snaps-monorepo/pull/751))

### Removed
- **BREAKING:** Remove deprecated `snap_getBip44Entropy_*` method ([#717](https://github.com/MetaMask/snaps-monorepo/pull/717))

### Fixed
- Fix race condition in `wallet_getSnaps` ([#756](https://github.com/MetaMask/snaps-monorepo/pull/756))
- Fix fingerprint derivation on BIP-32 and SLIP-10 nodes ([#773](https://github.com/MetaMask/snaps-monorepo/pull/773))
  - Accomplished by bumping `@metamask/key-tree` to `5.0.2`

## [0.20.0]
### Added
- **BREAKING:** Add Transaction Insight API ([#642](https://github.com/MetaMask/snaps-monorepo/pull/642))
- Add `snap_getBip44Entropy` RPC method and deprecate `snap_getBip44Entropy_*` ([#690](https://github.com/MetaMask/snaps-monorepo/pull/690))

### Changed
- **BREAKING:** Simplify manifest format for permission caveats ([#705](https://github.com/MetaMask/snaps-monorepo/pull/705))

## [0.19.1]
### Changed
- No changes this release.

## [0.19.0]
### Added
- **BREAKING:** Add `snap_getBip32Entropy` method ([#683](https://github.com/MetaMask/snaps-monorepo/pull/683))
- Add new validation and limit for storage ([#621](https://github.com/MetaMask/snaps-monorepo/pull/621))

## [0.18.1]
### Changed
- No changes this release.

## [0.18.0]
### Changed
- Reduce TypeScript compilation target to ES2017 ([#628](https://github.com/MetaMask/snaps-monorepo/pull/628))

## [0.17.0]
### Changed
- **BREAKING:** Bump minimum Node version to 16 ([#601](https://github.com/MetaMask/snaps-monorepo/pull/601))
- **BREAKING:** Replace `getRpcMessageHandler` action with `handleRpcRequest` ([#497](https://github.com/MetaMask/snaps-monorepo/pull/497), [#557](https://github.com/MetaMask/snaps-monorepo/pull/557))

## [0.16.0]
### Changed
- No changes this release.

## [0.15.0]
### Changed
- No changes this release.

## [0.14.0]
### Changed
- **BREAKING:** Increase TypeScript compilation target to ES2020 ([#449](https://github.com/MetaMask/snaps-monorepo/pull/449))
  - This should not be breaking for consumers on any non-deprecated browser or Node.js version.

## [0.13.0]
### Added
- **BREAKING:** Add in-app notifications ([#419](https://github.com/MetaMask/snaps-monorepo/pull/419))

### Changed
- **BREAKING:** Bump `@metamask/key-tree` to `4.0.0` ([#446](https://github.com/MetaMask/snaps-monorepo/pull/446))

## [0.12.0]
### Changed
- No changes this release.

## [0.11.1]
### Fixed
- Fixed an issue with determining whether existing permissions satisfy requested permissions ([#402](https://github.com/MetaMask/snaps-monorepo/pull/402))

## [0.11.0]
### Changed
- **BREAKING:** Wait for unlock on some RPC methods ([#356](https://github.com/MetaMask/snaps-monorepo/pull/356))
- **BREAKING:** Use PermissionController:revokePermissionForAllSubjects ([#351](https://github.com/MetaMask/snaps-monorepo/pull/351))
- Upgraded TypeScript version to minimum 4.4 ([#360](https://github.com/MetaMask/snaps-monorepo/pull/360))

### Fixed
- **BREAKING:** Fix prompting for existing permissions ([#354](https://github.com/MetaMask/snaps-monorepo/pull/354))

## [0.10.7]
### Changed
- **BREAKING:** Bump minimum Node version from 12 to 14 ([#331](https://github.com/MetaMask/snaps-monorepo/pull/331))

## [0.10.6]
### Changed
- No changes this release.

## [0.10.5]
### Changed
- No changes this release.

## [0.10.3]
### Changed
- Throw when trying to invoke a non-installed Snap ([#286](https://github.com/MetaMask/snaps-monorepo/pull/286))

## [0.10.0]
### Added
- `snap_notify` RPC method ([#234](https://github.com/MetaMask/snaps-monorepo/pull/234))

### Changed
- **BREAKING:** Enforce JSON-compatibility of snap state ([#233](https://github.com/MetaMask/snaps-monorepo/pull/233))
  - This state was always supposed to be JSON-compatible, and this is now enforced.

## [0.9.0]
### Changed
- `@metamask/controllers@^25.1.0` ([#207](https://github.com/MetaMask/snaps-monorepo/pull/207))

## [0.8.0]
### Changed
- No changes this release.

## [0.7.0]
### Changed
- No changes this release.

## [0.6.3]
### Changed
- No changes this release.

## [0.6.2]
### Changed
- **BREAKING:** Rename restricted method permission builder exports ([#171](https://github.com/MetaMask/snaps-monorepo/pull/171))

## [0.6.1]
### Fixed
- Fix `snap_confirm` validation logic ([#168](https://github.com/MetaMask/snaps-monorepo/pull/168))
  - [0.6.0] contained a bug where the method would reject most valid parameter combinations.

## [0.6.0]
### Added
- "Endowment" permissions ([#152](https://github.com/MetaMask/snaps-monorepo/pull/152))

### Changed
- **BREAKING:** Support the new Snaps publishing specification ([#140](https://github.com/MetaMask/snaps-monorepo/pull/140))
  - This introduces several breaking changes to how Snaps are developed, hosted, and represented at runtime. See [the specification](https://github.com/MetaMask/specifications/blob/d4a5bf5d6990bb5b02a98bd3f95a24ffb28c701c/snaps/publishing.md) and the referenced pull request for details.
- **BREAKING:** Rename Snap `name` property to `id` ([#147](https://github.com/MetaMask/snaps-monorepo/pull/147))
- **BREAKING:** Update `snap_confirm` parameters ([#158](https://github.com/MetaMask/snaps-monorepo/pull/158))
- Improve types and documentation for `selectHooks` ([#149](https://github.com/MetaMask/snaps-monorepo/pull/149))

### Fixed
- Restricted Snap method `origin` handling ([#150](https://github.com/MetaMask/snaps-monorepo/pull/150))

## [0.5.0]
### Added
- Added `title` and `subtitle` to `snap_confirm` ([#145](https://github.com/MetaMask/snaps-monorepo/pull/145))

### Changed
- **BREAKING:** Update restricted RPC methods per new `PermissionController` ([#143](https://github.com/MetaMask/snaps-monorepo/pull/143))
- **BREAKING:** Convert all TypeScript `interface` declarations to `type` equivalents ([#143](https://github.com/MetaMask/snaps-monorepo/pull/143))
- Update restricted RPC methods per new permissions system ([#143](https://github.com/MetaMask/snaps-monorepo/pull/143))

## [0.4.0]
### Changed
- **BREAKING:** Consolidate Snap state management methods into single method ([#135](https://github.com/MetaMask/snaps-monorepo/pull/135))
  - `snap_manageState`
- **BREAKING:** Replace RPC method and permission description properties with docstrings ([#130](https://github.com/MetaMask/snaps-monorepo/pull/130))

### Removed
- **BREAKING:** Remove `snap_manageAssets` ([#134](https://github.com/MetaMask/snaps-monorepo/pull/134))

## [0.3.1]
### Changed
- No changes this release.

## [0.3.0]
### Changed
- **BREAKING:** Make `wallet_getBip44Entropy_*` implementation safer ([#115](https://github.com/MetaMask/snaps-monorepo/pull/115))
  - Implemented by means of using [`@metamask/key-tree@^3.0.0](https://github.com/MetaMask/key-tree/releases/tag/v3.0.0)
- **BREAKING:** Enforce consistent naming for Snaps-related functionality ([#119](https://github.com/MetaMask/snaps-monorepo/pull/119))

## [0.2.2]
### Fixed
- Package script issues ([#97](https://github.com/MetaMask/snaps-monorepo/pull/97), [#98](https://github.com/MetaMask/snaps-monorepo/pull/98))

## [0.2.0]
### Changed
- Update publish scripts ([#92](https://github.com/MetaMask/snaps-monorepo/pull/92))

## [0.1.0]
### Added
- Readme file ([#71](https://github.com/MetaMask/snaps-monorepo/pull/71))

### Changed
- **BREAKING:** Rename package to `@metamask/rpc-methods` ([#73](https://github.com/MetaMask/snaps-monorepo/pull/73))

## [0.0.6]
### Changed
- **BREAKING:** Migrate `CommandEngine` message format to JSON-RPC ([#11](https://github.com/MetaMask/snaps-monorepo/pull/11))
- **BREAKING:** Use generic execution environment interface ([#19](https://github.com/MetaMask/snaps-monorepo/pull/19))

## [0.0.5]
### Added
- First semi-stable release.

[Unreleased]: https://github.com/MetaMask/snaps-monorepo/compare/v0.28.0...HEAD
[0.28.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.27.1...v0.28.0
[0.27.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.27.0...v0.27.1
[0.27.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.26.2...v0.27.0
[0.26.2]: https://github.com/MetaMask/snaps-monorepo/compare/v0.26.1...v0.26.2
[0.26.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.26.0...v0.26.1
[0.26.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.25.0...v0.26.0
[0.25.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.24.1...v0.25.0
[0.24.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.24.0...v0.24.1
[0.24.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.23.0...v0.24.0
[0.23.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.22.3...v0.23.0
[0.22.3]: https://github.com/MetaMask/snaps-monorepo/compare/v0.22.2...v0.22.3
[0.22.2]: https://github.com/MetaMask/snaps-monorepo/compare/v0.22.1...v0.22.2
[0.22.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.22.0...v0.22.1
[0.22.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.21.0...v0.22.0
[0.21.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.20.0...v0.21.0
[0.20.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.19.1...v0.20.0
[0.19.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.19.0...v0.19.1
[0.19.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.18.1...v0.19.0
[0.18.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.18.0...v0.18.1
[0.18.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.17.0...v0.18.0
[0.17.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.16.0...v0.17.0
[0.16.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.15.0...v0.16.0
[0.15.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.14.0...v0.15.0
[0.14.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.13.0...v0.14.0
[0.13.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.12.0...v0.13.0
[0.12.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.11.1...v0.12.0
[0.11.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.11.0...v0.11.1
[0.11.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.10.7...v0.11.0
[0.10.7]: https://github.com/MetaMask/snaps-monorepo/compare/v0.10.6...v0.10.7
[0.10.6]: https://github.com/MetaMask/snaps-monorepo/compare/v0.10.5...v0.10.6
[0.10.5]: https://github.com/MetaMask/snaps-monorepo/compare/v0.10.3...v0.10.5
[0.10.3]: https://github.com/MetaMask/snaps-monorepo/compare/v0.10.0...v0.10.3
[0.10.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.6.3...v0.7.0
[0.6.3]: https://github.com/MetaMask/snaps-monorepo/compare/v0.6.2...v0.6.3
[0.6.2]: https://github.com/MetaMask/snaps-monorepo/compare/v0.6.1...v0.6.2
[0.6.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.2.2...v0.3.0
[0.2.2]: https://github.com/MetaMask/snaps-monorepo/compare/v0.2.0...v0.2.2
[0.2.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.0.6...v0.1.0
[0.0.6]: https://github.com/MetaMask/snaps-monorepo/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/MetaMask/snaps-monorepo/releases/tag/v0.0.5
