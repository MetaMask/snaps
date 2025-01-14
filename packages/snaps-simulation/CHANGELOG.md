# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Uncategorized

- Bump MetaMask dependencies ([#2946](https://github.com/MetaMask/snaps-skunkworks.git/pull/2946))
- Expand testing for expanded-view notifications ([#2956](https://github.com/MetaMask/snaps-skunkworks.git/pull/2956))
- chore(deps): bump @metamask/permission-controller from 11.0.3 to 11.0.4 ([#2999](https://github.com/MetaMask/snaps-skunkworks.git/pull/2999))
- chore(deps): bump @metamask/phishing-controller from 12.0.2 to 12.3.1 ([#2991](https://github.com/MetaMask/snaps-skunkworks.git/pull/2991))
- feat: Add `hideBalances` to `snap_getPreferences` ([#2978](https://github.com/MetaMask/snaps-skunkworks.git/pull/2978))
- Add helper for background events ([#2974](https://github.com/MetaMask/snaps-skunkworks.git/pull/2974))
- Feat: Add background events ([#2941](https://github.com/MetaMask/snaps-skunkworks.git/pull/2941))
- BREAKING: Add support for new state methods to `snaps-simulation` ([#2966](https://github.com/MetaMask/snaps-skunkworks.git/pull/2966))

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

[Unreleased]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-simulation@1.5.0...HEAD
[1.5.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-simulation@1.4.1...@metamask/snaps-simulation@1.5.0
[1.4.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-simulation@1.4.0...@metamask/snaps-simulation@1.4.1
[1.4.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-simulation@1.3.1...@metamask/snaps-simulation@1.4.0
[1.3.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-simulation@1.3.0...@metamask/snaps-simulation@1.3.1
[1.3.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-simulation@1.2.0...@metamask/snaps-simulation@1.3.0
[1.2.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-simulation@1.1.1...@metamask/snaps-simulation@1.2.0
[1.1.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-simulation@1.1.0...@metamask/snaps-simulation@1.1.1
[1.1.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-simulation@1.0.1...@metamask/snaps-simulation@1.1.0
[1.0.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-simulation@1.0.0...@metamask/snaps-simulation@1.0.1
[1.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/releases/tag/@metamask/snaps-simulation@1.0.0
