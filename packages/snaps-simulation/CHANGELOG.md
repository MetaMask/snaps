# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Uncategorized

- Add onNameLookup to snaps-jest ([#2857](https://github.com/MetaMask/snaps-skunkworks.git/pull/2857))
- Add onInstall and onUpdate to snaps-jest ([#2849](https://github.com/MetaMask/snaps-skunkworks.git/pull/2849))

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

[Unreleased]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-simulation@1.2.0...HEAD
[1.2.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-simulation@1.1.1...@metamask/snaps-simulation@1.2.0
[1.1.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-simulation@1.1.0...@metamask/snaps-simulation@1.1.1
[1.1.0]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-simulation@1.0.1...@metamask/snaps-simulation@1.1.0
[1.0.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-simulation@1.0.0...@metamask/snaps-simulation@1.0.1
[1.0.0]: https://github.com/MetaMask/snaps-skunkworks.git/releases/tag/@metamask/snaps-simulation@1.0.0
