# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.28.0]
### Changed
- No changes this release.

## [0.27.1]
### Changed
- No changes this release.

## [0.27.0]
### Changed
- No changes this release.

## [0.26.2]
### Changed
- No changes this release.

## [0.26.1]
### Changed
- No changes this release.

## [0.26.0]
### Fixed
- Fix post processing issue with `object.eval` ([#1040](https://github.com/MetaMask/snaps-monorepo/pull/1040))

## [0.25.0]
### Changed
- No changes this release.

## [0.24.1]
### Changed
- No changes this release.

## [0.24.0]
### Added
- Add permission validation to SnapManifest ([#910](https://github.com/MetaMask/snaps-monorepo/pull/910))

### Fixed
- Remove double logging in CLI ([#958](https://github.com/MetaMask/snaps-monorepo/pull/958))

## [0.23.0]
### Changed
- **BREAKING:** Refactor `mm-snap init` command ([#866](https://github.com/MetaMask/snaps-monorepo/pull/866))
  - `mm-snap init` only takes one optional argument now, a directory for the snap to be initialized in.
  - It uses a new snap monorepo template.
- Replace auto type guard with struct ([#911](https://github.com/MetaMask/snaps-monorepo/pull/911))
- Replace JSON schema validation with structs ([#862](https://github.com/MetaMask/snaps-monorepo/pull/862))

## [0.22.3]
### Changed
- No changes this release.

## [0.22.2]
### Changed
- No changes this release.

## [0.22.1]
### Changed
- No changes this release.

## [0.22.0]
### Changed
- No changes this release.

## [0.21.0]
### Changed
- No changes this release.

## [0.20.0]
### Changed
- No changes this release.

## [0.19.1]
### Fixed
- Fixed 0.19.0 not being able to run ([#697](https://github.com/MetaMask/snaps-monorepo/pull/697))

## [0.19.0]
### Added
- Add 'Access-Control-Allow-Origin': * to serve ([#638](https://github.com/MetaMask/snaps-monorepo/pull/638))

### Changed
- **BREAKING:** Replace RegEx-based bundle processing and comment stripping with an AST-based solution ([#583](https://github.com/MetaMask/snaps-monorepo/pull/583))

## [0.18.1]
### Changed
- No changes this release.

## [0.18.0]
### Changed
- Reduce TypeScript compilation target to ES2017 ([#628](https://github.com/MetaMask/snaps-monorepo/pull/628))
- Update template files ([#632](https://github.com/MetaMask/snaps-monorepo/pull/632))

## [0.17.0]
### Added
- Add a TypeScript template for `mm-snap init` ([#546](https://github.com/MetaMask/snaps-monorepo/pull/546))
- Add serving to `mm-snap watch` ([#507](https://github.com/MetaMask/snaps-monorepo/pull/507))

### Changed
- **BREAKING:** Bump minimum Node version to 16 ([#601](https://github.com/MetaMask/snaps-monorepo/pull/601))

### Fixed
- Fix segfault when using `mm-snap watch` ([#556](https://github.com/MetaMask/snaps-monorepo/pull/556))

## [0.16.0]
### Changed
- **BREAKING:** Snaps are now required to export `onRpcRequest` to receive RPC requests ([#481](https://github.com/MetaMask/snaps-monorepo/pull/481), [#533](https://github.com/MetaMask/snaps-monorepo/pull/533), [#538](https://github.com/MetaMask/snaps-monorepo/pull/538), [#541](https://github.com/MetaMask/snaps-monorepo/pull/541), [#544](https://github.com/MetaMask/snaps-monorepo/pull/544))
  - The type of the function is available in `@metamask/snaps-types` as `OnRpcRequestHandler`.

### Fixed
- Fix importing local files in TypeScript Snaps ([#527](https://github.com/MetaMask/snaps-monorepo/pull/527))
- Fix `build` command when the CLI is installed globally ([#542](https://github.com/MetaMask/snaps-monorepo/pull/542))

## [0.15.0]
### Added
- Add support for building TypeScript Snaps ([#443](https://github.com/MetaMask/snaps-monorepo/pull/443))

### Fixed
- Fix an issue where comment stripping would break for large files ([#468](https://github.com/MetaMask/snaps-monorepo/pull/468))

## [0.14.0]
### Changed
- **BREAKING:** Increase TypeScript compilation target to ES2020 ([#449](https://github.com/MetaMask/snaps-monorepo/pull/449))
  - This should not be breaking for consumers on any non-deprecated browser or Node.js version.

## [0.13.0]
### Changed
- No changes this release.

## [0.12.0]
### Changed
- No changes this release.

## [0.11.1]
### Changed
- No changes this release.

## [0.11.0]
### Added
- Add self to mock endowments ([#341](https://github.com/MetaMask/snaps-monorepo/pull/341))

### Changed
- Bump `ses` to `0.15.15` ([#396](https://github.com/MetaMask/snaps-monorepo/pull/396))
- Upgraded TypeScript version to minimum 4.4 ([#360](https://github.com/MetaMask/snaps-monorepo/pull/360))
- Update template files ([#350](https://github.com/MetaMask/snaps-monorepo/pull/350))

## [0.10.7]
### Changed
- **BREAKING:** Bump minimum Node version from 12 to 14 ([#331](https://github.com/MetaMask/snaps-monorepo/pull/331))
- Update `mm-snap init` template files ([#330](https://github.com/MetaMask/snaps-monorepo/pull/330))

### Fixed
- Fix issue where comment stripping would create invalid bundles ([#336](https://github.com/MetaMask/snaps-monorepo/pull/336))

## [0.10.6]
### Fixed
- Fix endowment mocking during `mm-snap eval` ([#311](https://github.com/MetaMask/snaps-monorepo/pull/311))

## [0.10.5]
### Changed
- No changes this release.

## [0.10.3]
### Fixed
- Improve dynamic mocking ([#262](https://github.com/MetaMask/snaps-monorepo/pull/262))

## [0.10.2]
### Fixed
- Installation failure ([#279](https://github.com/MetaMask/snaps-monorepo/pull/279))
  - A faulty installation script in a dependency caused the installation of this package to fail.

## [0.10.1]
### Fixed
- Comment stripping will no longer remove empty block comments in strings ([#276](https://github.com/MetaMask/snaps-monorepo/pull/276))

## [0.10.0]
### Added
- **BREAKING:** Transform HTML comments by default ([#237](https://github.com/MetaMask/snaps-monorepo/pull/237))
  - The strings `<!--` and `-->` will be transformed into `< !--` and `-- >` respectively by default. If these strings appear as operands in an expression or in a string literal, this transform will change the behavior of your program. This behavior was added because these strings are rejected by SES. The behavior can be toggled using the `--transformHtmlComments` option.
- `--transpiledDeps` flag to `build` and `watch` commands ([#221](https://github.com/MetaMask/snaps-monorepo/pull/221))
  - This flag allows the user to specify which dependencies will be transpiled at build time if the `--transpilationMode` is `--localAndDeps`.
- Add CLI usage instructions to readme ([#228](https://github.com/MetaMask/snaps-monorepo/pull/228))
- Build process customization ([#251](https://github.com/MetaMask/snaps-monorepo/pull/251))
  - Builds can now be customized by adding a `bundlerCustomizer` function to `snap.config.js`. See the README for details.

### Changed
- **BREAKING:** Change Snap config file format ([#251](https://github.com/MetaMask/snaps-monorepo/pull/251))
  - The CLI now expects a file `snap.config.js` instead of `snap.config.json`, with a different structure. See the README for details.
- **BREAKING:** Strip comments in source code by default ([#243](https://github.com/MetaMask/snaps-monorepo/pull/243))
  - All comments will now be stripped from snap source code (including dependencies) by default.
- Enable `--verboseErrors` by default ([#249](https://github.com/MetaMask/snaps-monorepo/pull/249))

### Fixed
- Comment stripping bug ([#270](https://github.com/MetaMask/snaps-monorepo/pull/270))
  - Prior to this change, if the `--strip-comments` option was provided to `mm-snap build` and an empty block comment of the form `/**/` appeared anywhere in the source code (including dependencies), the remainder of the string after the empty block comment would be truncated. This was resolved by removing all instances of the string `/**/` from the raw bundle string.
  - In an upcoming release, the string `/**/` will only be removed if it is in fact an empty block comment, and not if it e.g. appears in a string literal.
- `watch` command parity with `build` command ([#241](https://github.com/MetaMask/snaps-monorepo/pull/241))
  - The `build` command had received a number of options that were not made available to the `watch` command. They now have the same options.
- Update dead link in readme ([#240](https://github.com/MetaMask/snaps-monorepo/pull/240))

## [0.9.0]
### Added
- Transpilation configuration ([#213](https://github.com/MetaMask/snaps-monorepo/pull/213))
  - `mm-snap build` now takes a `--transpilationMode` argument which determines what will be transpiled by Babel during building: all source code (including dependencies), local source code only, or nothing.

### Fixed
- `mm-snap build` command when CLI is installed globally ([#216](https://github.com/MetaMask/snaps-monorepo/pull/216))
- Update installation command in readme ([#205](https://github.com/MetaMask/snaps-monorepo/pull/205))

## [0.8.0]
### Changed
- Update template snap created by `mm-snap init` ([#195](https://github.com/MetaMask/snaps-monorepo/pull/195))
- Exit by throwing errors instead of calling `process.exit` ([#190](https://github.com/MetaMask/snaps-monorepo/pull/190))

## [0.7.0]
### Added
- ESM support for `mm-snap build` ([#185](https://github.com/MetaMask/snaps-monorepo/pull/185))
  - The `build` command can now handle snap source code that includes ESM import / export statements. They will be transpiled to their CommonJS equivalents via Babel.

### Fixed
- Fix `mm-snap init` `src` default value ([#186](https://github.com/MetaMask/snaps-monorepo/pull/186))
  - It now correctly defaults to `src/index.js` instead of just `index.js`.
- Fix comment stripping ([#189](https://github.com/MetaMask/snaps-monorepo/pull/189))
  - Comments wouldn't be stripped under certain circumstances due to a RegEx error, details [here](https://github.com/jonschlinkert/strip-comments/pull/49).

## [0.6.3]
### Changed
- No changes this release.

## [0.6.2]
### Changed
- No changes this release.

## [0.6.1]
### Fixed
- `mm-snap init` Snap `snap_confirm` call ([#168](https://github.com/MetaMask/snaps-monorepo/pull/168))
  - The generated Snap was passing invalid parameters to the method.

## [0.6.0]
### Added
- Snap SVG icon support ([#163](https://github.com/MetaMask/snaps-monorepo/pull/163))

### Changed
- **BREAKING:** Support the new Snaps publishing specification ([#140](https://github.com/MetaMask/snaps-monorepo/pull/140), [#160](https://github.com/MetaMask/snaps-monorepo/pull/160))
  - This introduces several breaking changes to how Snaps are developed, hosted, and represented at runtime. See [the specification](https://github.com/MetaMask/specifications/blob/d4a5bf5d6990bb5b02a98bd3f95a24ffb28c701c/snaps/publishing.md) and the referenced pull requests for details.
- **BREAKING:** Rename Snap `name` property to `id` ([#147](https://github.com/MetaMask/snaps-monorepo/pull/147))
- **BREAKING:** Update `ses` to version `^0.15.3` ([#159](https://github.com/MetaMask/snaps-monorepo/pull/159))
  - This will cause behavioral changes for code executed under SES, and may require modifications to code that previously executed without issues.

## [0.5.0]
### Changed
- **BREAKING:** Convert all TypeScript `interface` declarations to `type` equivalents ([#143](https://github.com/MetaMask/snaps-monorepo/pull/143))

## [0.4.0]
### Fixed
- Make Windows-compatible ([#131](https://github.com/MetaMask/snaps-monorepo/pull/131))

## [0.3.1]
### Changed
- No changes this release.

## [0.3.0]
### Changed
- **BREAKING:** Enforce consistent naming for Snaps-related functionality ([#119](https://github.com/MetaMask/snaps-monorepo/pull/119))

## [0.2.2]
### Fixed
- Package script issues ([#97](https://github.com/MetaMask/snaps-monorepo/pull/97), [#98](https://github.com/MetaMask/snaps-monorepo/pull/98))

## [0.2.1]
### Fixed
- Snap produced by `mm-snap init` ([#94](https://github.com/MetaMask/snaps-monorepo/pull/94))
  - The template used to create the "Hello, world!" snap had become outdated due to a build-time bug.

## [0.2.0]
### Changed
- Update publish scripts ([#92](https://github.com/MetaMask/snaps-monorepo/pull/92))

## [0.1.1]
### Added
- Missing publish scripts to new packages

## [0.1.0]
### Changed
- **BREAKING:** Rename package to `@metamask/snaps-cli` ([#72](https://github.com/MetaMask/snaps-monorepo/pull/72))
  - This package was previously named [`snaps-cli`](https://npmjs.com/package/snaps-cli).
  - As part of the renaming, and due to the scope of the changes to both this package and MetaMask Snaps generally, its versioning and changelog have been reset. The original changelog can be found [here](https://github.com/MetaMask/snaps-cli/blob/main/CHANGELOG.md).

### Removed
- Example snaps ([#72](https://github.com/MetaMask/snaps-monorepo/pull/72))
  - The examples now live in their own package, [`@metamask/snap-examples`](https://npmjs.com/package/@metamask/snap-examples).

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
[0.10.3]: https://github.com/MetaMask/snaps-monorepo/compare/v0.10.2...v0.10.3
[0.10.2]: https://github.com/MetaMask/snaps-monorepo/compare/v0.10.1...v0.10.2
[0.10.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.10.0...v0.10.1
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
[0.2.2]: https://github.com/MetaMask/snaps-monorepo/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/MetaMask/snaps-monorepo/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/MetaMask/snaps-monorepo/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/MetaMask/snaps-monorepo/releases/tag/v0.1.0
