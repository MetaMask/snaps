# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Uncategorized

- Migrate to ESLint 9 ([#3118](https://github.com/MetaMask/snaps/pull/3118))
- Release 90.0.0 ([#3123](https://github.com/MetaMask/snaps/pull/3123))
- Release 88.0.0 ([#3061](https://github.com/MetaMask/snaps/pull/3061))
- Release 87.0.0 ([#3055](https://github.com/MetaMask/snaps/pull/3055))
- Release 85.0.0 ([#3038](https://github.com/MetaMask/snaps/pull/3038))
- Release 82.0.0 ([#3012](https://github.com/MetaMask/snaps/pull/3012))
- Release 81.0.0 ([#2964](https://github.com/MetaMask/snaps/pull/2964))
- feat: Automatically add `platformVersion` to manifest ([#2938](https://github.com/MetaMask/snaps/pull/2938))
- feat: Allow async initialization logic ([#2918](https://github.com/MetaMask/snaps/pull/2918))
- Add onNameLookup to snaps-jest ([#2857](https://github.com/MetaMask/snaps/pull/2857))
- Add TypeScript typechecking to snaps-cli ([#2783](https://github.com/MetaMask/snaps/pull/2783))
- Format Snap manifests with Prettier ([#2787](https://github.com/MetaMask/snaps/pull/2787))
- Update Yarn constraints to use JavaScript-based constraints ([#2740](https://github.com/MetaMask/snaps/pull/2740))
- Update metadata for all packages ([#2748](https://github.com/MetaMask/snaps/pull/2748))
- Add `since-latest-release` script to match `MetaMask/core` ([#2744](https://github.com/MetaMask/snaps/pull/2744))
- Update test scripts to match `MetaMask/core` ([#2745](https://github.com/MetaMask/snaps/pull/2745))
- Fix linting of `package.json` files ([#2742](https://github.com/MetaMask/snaps/pull/2742))
- Update changelog validation scripts to match `MetaMask/core` ([#2741](https://github.com/MetaMask/snaps/pull/2741))

## [3.1.1]

### Fixed

- Bump MetaMask dependencies

## [3.1.0]

### Changed

- Update `onNameLookup` response to include `domainName` ([#2484](https://github.com/MetaMask/snaps/pull/2484))

## [3.0.2]

### Changed

- Re-release after multiple changes in the monorepo ([#2295](https://github.com/MetaMask/snaps/pull/2295))

## [3.0.1]

### Changed

- Remove snap icon ([#2189](https://github.com/MetaMask/snaps/pull/2189))

## [3.0.0]

### Changed

- **BREAKING:** Update snap to match new API ([#2113](https://github.com/MetaMask/snaps/pull/2113))
  - This includes updating the permission format in the manifest as well as adjusting the return values.

## [2.1.0]

### Changed

- Use `@metamask/snaps-sdk` package ([#1946](https://github.com/MetaMask/snaps/pull/1946))
  - This package replaces the `@metamask/snaps-types` and
  - `@metamask/snaps-ui` packages, and is much more lightweight.

## [2.0.1]

### Changed

- Update multiple MetaMask dependencies ([#1841](https://github.com/MetaMask/snaps/pull/1841))

## [2.0.0]

### Changed

- **BREAKING:** Bump minimum Node.js version to `^18.16.0` ([#1741](https://github.com/MetaMask/snaps/pull/1741))

## [1.0.0]

### Added

- Add name lookup example snap ([#1768](https://github.com/MetaMask/snaps/pull/1768), [#1754](https://github.com/MetaMask/snaps/pull/1754))

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/name-lookup-example-snap@3.1.1...HEAD
[3.1.1]: https://github.com/MetaMask/snaps/compare/@metamask/name-lookup-example-snap@3.1.0...@metamask/name-lookup-example-snap@3.1.1
[3.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/name-lookup-example-snap@3.0.2...@metamask/name-lookup-example-snap@3.1.0
[3.0.2]: https://github.com/MetaMask/snaps/compare/@metamask/name-lookup-example-snap@3.0.1...@metamask/name-lookup-example-snap@3.0.2
[3.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/name-lookup-example-snap@3.0.0...@metamask/name-lookup-example-snap@3.0.1
[3.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/name-lookup-example-snap@2.1.0...@metamask/name-lookup-example-snap@3.0.0
[2.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/name-lookup-example-snap@2.0.1...@metamask/name-lookup-example-snap@2.1.0
[2.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/name-lookup-example-snap@2.0.0...@metamask/name-lookup-example-snap@2.0.1
[2.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/name-lookup-example-snap@1.0.0...@metamask/name-lookup-example-snap@2.0.0
[1.0.0]: https://github.com/MetaMask/snaps/releases/tag/@metamask/name-lookup-example-snap@1.0.0
