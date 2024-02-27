# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [7.0.1]
### Fixed
- Fix minor build configuration problems ([#2220](https://github.com/MetaMask/snaps/pull/2220))

## [7.0.0]
### Changed
- **BREAKING:** Update ESM build to be fully compliant with the ESM standard ([#2210](https://github.com/MetaMask/snaps/pull/2210))
- Bump `@metamask/rpc-errors` to `^6.2.1` ([#2209](https://github.com/MetaMask/snaps/pull/2209))

## [6.0.0]
### Added
- **BREAKING:** Add support for dynamic user interfaces ([#1465](https://github.com/MetaMask/snaps/pull/1465), [#2144](https://github.com/MetaMask/snaps/pull/2144), [#2143](https://github.com/MetaMask/snaps/pull/2143))
  - This adds the `snap_createInterface`, `snap_updateInterface`, and `snap_getInterfaceState` methods.
  - This is breaking because it changes the expected type of the `showDialog` RPC method hook.
- **BREAKING:** Update the permission format for the name lookup endowment ([#2113](https://github.com/MetaMask/snaps/pull/2113))
  - The new format is documented in [SIP-12](https://metamask.github.io/SIPs/SIPS/sip-12).
- Add endowment permission specifications to this package ([#2155](https://github.com/MetaMask/snaps/pull/2155))

### Changed
- Bump MetaMask dependencies ([#2129](https://github.com/MetaMask/snaps/pull/2129), [#2142](https://github.com/MetaMask/snaps/pull/2142))

## [5.0.0]
### Added
- Add `snap_getClientStatus` ([#2051](https://github.com/MetaMask/snaps/pull/2051))

### Changed
- **BREAKING:** Use origin bound hooks for `invokeKeyring` ([#2090](https://github.com/MetaMask/snaps/pull/2090))
- Bump several MetaMask dependencies ([#2069](https://github.com/MetaMask/snaps/pull/2069), [#2100](https://github.com/MetaMask/snaps/pull/2100))

## [4.1.0]
### Added
- Add `wallet_getAllSnaps` method to get all installed Snaps ([#2047](https://github.com/MetaMask/snaps/pull/2047))

### Changed
- Bump several MetaMask dependencies ([#2064](https://github.com/MetaMask/snaps/pull/2064), [#2065](https://github.com/MetaMask/snaps/pull/2065))

## [4.0.3]
### Changed
- Use prototype `startsWith` for RPC method middleware ([#2035](https://github.com/MetaMask/snaps/pull/2035))

## [4.0.2]
### Changed
- Bump several MetaMask dependencies ([#1989](https://github.com/MetaMask/snaps/pull/1989))

## [4.0.1]
### Changed
- Bump several MetaMask dependencies ([#1964](https://github.com/MetaMask/snaps/pull/1964), [#1968](https://github.com/MetaMask/snaps/pull/1968))

## [4.0.0]
### Changed
- Use `@metamask/snaps-sdk` package ([#1930](https://github.com/MetaMask/snaps/pull/1930),
  [#1950](https://github.com/MetaMask/snaps/pull/1950), [#1954](https://github.com/MetaMask/snaps/pull/1954))
  - This package replaces the `@metamask/snaps-types` and
  - `@metamask/snaps-ui` packages.

### Removed
- **BREAKING**: Remove `DialogType`, `ManageStateOperation`, and `NotificationType` enums ([#1930](https://github.com/MetaMask/snaps/pull/1930))
  - These are now defined in the `@metamask/snaps-sdk` package.

## [3.3.0]
### Added
- Add support for unencrypted storage using `snap_manageState` ([#1902](https://github.com/MetaMask/snaps/pull/1902))

## [3.2.1]
### Fixed
- Fix `assertLinksAreSafe` import ([#1908](https://github.com/MetaMask/snaps/pull/1908))

## [3.2.0]
### Added
- Add support for links in custom UI and notifications ([#1814](https://github.com/MetaMask/snaps/pull/1814))

## [3.1.0]
### Changed
- Rename package to `@metamask/snaps-rpc-methods` ([#1864](https://github.com/MetaMask/snaps/pull/1864))
- Update multiple MetaMask dependencies ([#1841](https://github.com/MetaMask/snaps/pull/1841))

## [3.0.0]
### Added
- Add keyring export and endowment ([#1787](https://github.com/MetaMask/snaps/pull/1787))

### Changed
- **BREAKING:** Bump minimum Node.js version to `^18.16.0` ([#1741](https://github.com/MetaMask/snaps/pull/1741))

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

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rpc-methods@7.0.1...HEAD
[7.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rpc-methods@7.0.0...@metamask/snaps-rpc-methods@7.0.1
[7.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rpc-methods@6.0.0...@metamask/snaps-rpc-methods@7.0.0
[6.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rpc-methods@5.0.0...@metamask/snaps-rpc-methods@6.0.0
[5.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rpc-methods@4.1.0...@metamask/snaps-rpc-methods@5.0.0
[4.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rpc-methods@4.0.3...@metamask/snaps-rpc-methods@4.1.0
[4.0.3]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rpc-methods@4.0.2...@metamask/snaps-rpc-methods@4.0.3
[4.0.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rpc-methods@4.0.1...@metamask/snaps-rpc-methods@4.0.2
[4.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rpc-methods@4.0.0...@metamask/snaps-rpc-methods@4.0.1
[4.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rpc-methods@3.3.0...@metamask/snaps-rpc-methods@4.0.0
[3.3.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rpc-methods@3.2.1...@metamask/snaps-rpc-methods@3.3.0
[3.2.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rpc-methods@3.2.0...@metamask/snaps-rpc-methods@3.2.1
[3.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rpc-methods@3.1.0...@metamask/snaps-rpc-methods@3.2.0
[3.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rpc-methods@3.0.0...@metamask/snaps-rpc-methods@3.1.0
[3.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rpc-methods@2.0.0...@metamask/snaps-rpc-methods@3.0.0
[2.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rpc-methods@0.38.3-flask.1...@metamask/snaps-rpc-methods@2.0.0
[0.38.3-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rpc-methods@0.38.2-flask.1...@metamask/snaps-rpc-methods@0.38.3-flask.1
[0.38.2-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rpc-methods@0.38.1-flask.1...@metamask/snaps-rpc-methods@0.38.2-flask.1
[0.38.1-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rpc-methods@0.38.0-flask.1...@metamask/snaps-rpc-methods@0.38.1-flask.1
[0.38.0-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-rpc-methods@0.37.2-flask.1...@metamask/snaps-rpc-methods@0.38.0-flask.1
[0.37.2-flask.1]: https://github.com/MetaMask/snaps/releases/tag/@metamask/snaps-rpc-methods@0.37.2-flask.1
