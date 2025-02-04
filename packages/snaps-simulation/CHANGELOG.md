# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Uncategorized

- chore: Rename `ControllerMessenger` to `Messenger` ([#3053](https://github.com/MetaMask/snaps/pull/3053))
- feat: Implement `MultichainRouter` and `onProtocolRequest` (SIP-26) ([#2875](https://github.com/MetaMask/snaps/pull/2875))
- feat: Add `URLSearchParams` as a default endowment ([#3047](https://github.com/MetaMask/snaps/pull/3047))
- feat: Add `Intl` as a default endowment ([#3035](https://github.com/MetaMask/snaps/pull/3035))
- feat: Implement SIP-29 permission and handlers ([#3028](https://github.com/MetaMask/snaps/pull/3028))

## [2.1.0]

### Added

- Mock `eth_chainId` and `net_version` calls automatically ([#3017](https://github.com/MetaMask/snaps/pull/3017))

## [2.0.0]

### Added

- **BREAKING:** Add support for new state methods to `snaps-simulation` ([#2966](https://github.com/MetaMask/snaps/pull/2966))
  - The `MiddlewareHooks` type was removed.
- Add `hideBalances` to `snap_getPreferences` ([#2978](https://github.com/MetaMask/snaps/pull/2978))
- Allow unit testing of expanded-view notifications ([#2956](https://github.com/MetaMask/snaps/pull/2956))
- Add `onBackgroundEvent` alias ([#2974](https://github.com/MetaMask/snaps/pull/2974))

### Changed

- Bump MetaMask dependencies ([#2946](https://github.com/MetaMask/snaps/pull/2946), [#2991](https://github.com/MetaMask/snaps/pull/2991), [#2999](https://github.com/MetaMask/snaps/pull/2999))

## [1.5.0]

### Added

- Add `waitForUpdate` interface action ([#2960](https://github.com/MetaMask/snaps/pull/2960))
- Add support for `onSettingsPage` export ([#2911](https://github.com/MetaMask/snaps/pull/2911))

## [1.4.1]

### Changed

- Bump `@metamask/key-tree` from `^9.1.2` to `^10.0.1` ([#2909](https://github.com/MetaMask/snaps/pull/2909))

## [1.4.0]

### Added

- Add `snap_getInterfaceContext` JSON-RPC method ([#2902](https://github.com/MetaMask/snaps/pull/2902))

## [1.3.1]

### Added

- Add interface persistence ([#2856](https://github.com/MetaMask/snaps/pull/2856))

## [1.3.0]

### Added

- Add function to test `onNameLookup` ([#2857](https://github.com/MetaMask/snaps/pull/2857))
- Add function to test `onInstall` and `onUpdate` ([#2849](https://github.com/MetaMask/snaps/pull/2849))

### Changed

- Bump MetaMask dependencies ([#2853](https://github.com/MetaMask/snaps/pull/2853))

## [1.2.0]

### Added

- Add support for button `form` property ([#2830](https://github.com/MetaMask/snaps/pull/2830))
- Add function to test `onKeyringRequest` ([#2777](https://github.com/MetaMask/snaps/pull/2777))
  - The `onKeyringRequest` function can be used to test keyring requests.

## [1.1.1]

### Removed

- Remove `eth_sign` ([#2772](https://github.com/MetaMask/snaps/pull/2772))
  - This method was removed from the MetaMask extension, so any references to it
    in Snaps can be removed.

### Fixed

- Add missing dependency on `@metamask/snaps-execution-environments` ([#2791](https://github.com/MetaMask/snaps/pull/2791))

## [1.1.0]

### Changed

- Move helper functions to simulation package ([#2769](https://github.com/MetaMask/snaps/pull/2769))

## [1.0.1]

### Fixed

- Fix invalid `exports` field ([#2740](https://github.com/MetaMask/snaps/pull/2740))

## [1.0.0]

### Added

- Initial release of `@metamask/snaps-simulation` package ([#2727](https://github.com/MetaMask/snaps/pull/2727))

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@2.1.0...HEAD
[2.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@2.0.0...@metamask/snaps-simulation@2.1.0
[2.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@1.5.0...@metamask/snaps-simulation@2.0.0
[1.5.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@1.4.1...@metamask/snaps-simulation@1.5.0
[1.4.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@1.4.0...@metamask/snaps-simulation@1.4.1
[1.4.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@1.3.1...@metamask/snaps-simulation@1.4.0
[1.3.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@1.3.0...@metamask/snaps-simulation@1.3.1
[1.3.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@1.2.0...@metamask/snaps-simulation@1.3.0
[1.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@1.1.1...@metamask/snaps-simulation@1.2.0
[1.1.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@1.1.0...@metamask/snaps-simulation@1.1.1
[1.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@1.0.1...@metamask/snaps-simulation@1.1.0
[1.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-simulation@1.0.0...@metamask/snaps-simulation@1.0.1
[1.0.0]: https://github.com/MetaMask/snaps/releases/tag/@metamask/snaps-simulation@1.0.0
