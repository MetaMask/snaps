# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [8.2.0]

### Uncategorized

- feat: Allow eval in watch mode ([#3553](https://github.com/MetaMask/snaps/pull/3553))
- chore: update configuration section anchor in snaps-cli/README ([#3537](https://github.com/MetaMask/snaps/pull/3537))

## [8.1.1]

### Fixed

- Display CLI minimum version range properly ([#3531](https://github.com/MetaMask/snaps/pull/3531))

## [8.1.0]

### Added

- Support scheduling cronjobs with an ISO 8601 duration ([#3421](https://github.com/MetaMask/snaps/pull/3421))

## [8.0.0]

### Changed

- **BREAKING:** Drop support for Node.js 18 and 21 ([#3447](https://github.com/MetaMask/snaps/pull/3447))
- Bump minimum supported browser versions ([#3441](https://github.com/MetaMask/snaps/pull/3441))
  - The minimum supported browser versions are now:
    - Chrome 113
    - Firefox 115
- Bump `@swc/core` from `1.3.78` to `1.11.31` ([#3442](https://github.com/MetaMask/snaps/pull/3442))
- Bump `swc-loader` from `0.2.3` to `0.2.6` ([#3442](https://github.com/MetaMask/snaps/pull/3442))

## [7.2.0]

### Added

- Validate platform version against production ([#3417](https://github.com/MetaMask/snaps/pull/3417))
- Detect unused permissions ([#3335](https://github.com/MetaMask/snaps/pull/3335))

## [7.1.0]

### Added

- Add `sandbox` command to run sandbox tool ([#3306](https://github.com/MetaMask/snaps/pull/3306))
  - This command allows you to run the Snaps sandbox tool, which is useful for
    quickly testing and debugging Snaps.

### Changed

- Bump `@metamask/utils` from `11.2.0` to `11.4.0` ([#3232](https://github.com/MetaMask/snaps/pull/3232))

## [7.0.0]

### Changed

- **BREAKING:** Remove deprecated Browserify configuration ([#3313](https://github.com/MetaMask/snaps/pull/3313))
  - The Browserify bundler is no longer supported. Snaps using the Browserify
    bundler will need to be migrated to the new configuration format based on
    Webpack.
  - The `bundler` option in the Snap configuration file was removed, and the CLI
    will show an error if it's used in config.
  - Several command line flags that were used to configure the Browserify
    bundler were removed.
    - Use the config file to provide these options instead.
    - The removed options are:
      - `--bundle`
      - `--dist`
      - `--eval`
      - `--manifest`
      - `--outfileName`
      - `--root`
      - `--sourceMaps`
      - `--src`
      - `--stripComments`
      - `--suppressWarnings`
      - `--transpilationMode`
      - `--depsToTranspile`
      - `--verboseErrors`
      - `--writeManifest`
      - `--serve`

## [6.7.0]

### Added

- Add `--analyze` flag to build command to enable bundle analyzer ([#3075](https://github.com/MetaMask/snaps/pull/3075))

## [6.6.1]

### Changed

- Bump MetaMask dependencies ([#2946](https://github.com/MetaMask/snaps/pull/2946))

### Fixed

- Disable `nodeEnv` optimization in Webpack ([#2970](https://github.com/MetaMask/snaps/pull/2970))
  - This previously caused issues with overwriting `NODE_ENV`.

## [6.6.0]

### Added

- Allow async initialization logic ([#2918](https://github.com/MetaMask/snaps/pull/2918))
  - Top-level-await is now available in Snaps.
  - WASM modules are instantiated asynchronously.
- Automatically add `platformVersion` to manifest ([#2938](https://github.com/MetaMask/snaps/pull/2938))

## [6.5.4]

### Fixed

- Bundle and initialize WASM modules using Base64 encoding ([#2913](https://github.com/MetaMask/snaps/pull/2913))

## [6.5.3]

### Fixed

- Ignore query strings when parsing URLs ([#2883](https://github.com/MetaMask/snaps/pull/2883))

## [6.5.2]

### Changed

- Bump MetaMask dependencies ([#2853](https://github.com/MetaMask/snaps/pull/2853))

## [6.5.1]

### Fixed

- Move `fork-ts-checker-webpack-plugin` to dependencies ([#2862](https://github.com/MetaMask/snaps/pull/2862))

## [6.5.0]

### Added

- Add support for TypeScript type-checking ([#2783](https://github.com/MetaMask/snaps/pull/2783))
  - This introduces a new configuration option, `typescript.enabled`, which can
    be set to `true` to enable TypeScript type-checking.
  - You can optionally specify a custom `tsconfig.json` file by setting
    `typescript.configFile` to the path of the file.

## [6.4.0]

### Changed

- Format Snap manifests with Prettier ([#2787](https://github.com/MetaMask/snaps/pull/2787))

## [6.3.4]

### Changed

- Bump `@metamask/snaps-sdk` to `^6.7.0` ([#2770](https://github.com/MetaMask/snaps/pull/2770))
- Bump `@metamask/snaps-utils` to `^8.3.0` ([#2770](https://github.com/MetaMask/snaps/pull/2770))

## [6.3.3]

### Fixed

- Fix invalid types in type declaration in some cases ([#2714](https://github.com/MetaMask/snaps/pull/2714))

## [6.3.2]

### Fixed

- Fix ESM version of the package ([#2682](https://github.com/MetaMask/snaps/pull/2682))
  - This fixes the ESM version of the package to be fully compliant with the ESM
    standard.
- Bump `@metamask/utils` from `^9.1.0` to `^9.2.1` ([#2680](https://github.com/MetaMask/snaps/pull/2680))

## [6.3.1]

### Fixed

- Hide browserlist warning where applicable ([#2664](https://github.com/MetaMask/snaps/pull/2664))

## [6.3.0]

### Changed

- Improve manifest validation output ([#2572](https://github.com/MetaMask/snaps/pull/2572))
- Replace `superstruct` with ESM-compatible fork `@metamask/superstruct` ([#2445](https://github.com/MetaMask/snaps/pull/2445))

## [6.2.1]

### Fixed

- Improve validation of `endowment:rpc` ([#2512](https://github.com/MetaMask/snaps/pull/2512))

## [6.2.0]

### Added

- Add support for building Snaps with JSX ([#2258](https://github.com/MetaMask/snaps/pull/2258))
  - It's now possible to use JSX components from `@metamask/snaps-sdk` to build
    user interfaces for Snaps.

## [6.1.1]

### Fixed

- Disable `topLevelAwait` configuration option ([#2358](https://github.com/MetaMask/snaps/pull/2358))
  - Before this the CLI would produce invalid builds when using top-level await.

## [6.1.0]

### Added

- Add support for importing SVG, PNG, and JPEG files directly ([#2284](https://github.com/MetaMask/snaps/pull/2284))
  - You can now import these files using a regular import declaration when using the Webpack-based config.
  - To opt out of this feature (i.e., to use custom image loading logic), add the following to your config:
    ```ts
    {
      features: {
        images: false,
      },
    }
    ```

### Changed

- Update CLI docs link ([#2294](https://github.com/MetaMask/snaps/pull/2294))

### Fixed

- Fix detection of minimum Node.js version ([#2292](https://github.com/MetaMask/snaps/pull/2292))

## [6.0.2]

### Fixed

- Publish `.browserslistrc` ([#2227](https://github.com/MetaMask/snaps/pull/2227))

## [6.0.1]

### Fixed

- Fix minor build configuration problems ([#2220](https://github.com/MetaMask/snaps/pull/2220))

## [6.0.0]

### Changed

- **BREAKING:** Update ESM build to be fully compliant with the ESM standard ([#2210](https://github.com/MetaMask/snaps/pull/2210))
- **BREAKING:** Change config to use Webpack by default ([#2214](https://github.com/MetaMask/snaps/pull/2214))
  - You can still use Browserify by specifying `bundler: 'browserify'`.

## [5.1.1]

### Fixed

- Support new lines in CLI message formatting ([#2194](https://github.com/MetaMask/snaps/pull/2194))

## [5.1.0]

### Changed

- Optimize CLI Webpack configuration ([#2175](https://github.com/MetaMask/snaps/pull/2175))
  - This can reduce the size of Snaps in certain cases.
- Show Webpack compilation warnings in CLI ([#2186](https://github.com/MetaMask/snaps/pull/2186), [#2192](https://github.com/MetaMask/snaps/pull/2192))
- Add a warning when no icon is found and when icon is not square ([#2185](https://github.com/MetaMask/snaps/pull/2185))

## [5.0.0]

### Changed

- **BREAKING:** Disable source maps by default ([#2166](https://github.com/MetaMask/snaps/pull/2166))
  - This slightly speeds up the build process.
  - You can enable source maps again by setting `sourceMap: true` in your Snap config.
- Set `output.chunkFormat` to `commonjs` by default ([#2136](https://github.com/MetaMask/snaps/pull/2136))

## [4.0.1]

### Fixed

- Fix missing `global` during snap evaluation ([#2072](https://github.com/MetaMask/snaps/pull/2072))

## [4.0.0]

### Changed

- **BREAKING:** Synchronously initialize WASM modules ([#2024](https://github.com/MetaMask/snaps/pull/2024))
  - When the `experimental.wasm` flag in the Snaps CLI is enabled, the WASM module will now be synchronously initialized, rather than being inlined as a Uint8Array.

## [3.0.5]

### Fixed

- Include Snap icon in allowed server paths ([#2003](https://github.com/MetaMask/snaps/pull/2003))

## [3.0.4]

### Fixed

- Only serve Snap files from CLI ([#1979](https://github.com/MetaMask/snaps/pull/1979))

## [3.0.3]

### Changed

- Bump several MetaMask dependencies ([#1964](https://github.com/MetaMask/snaps/pull/1964))

### Fixed

- Fix issues generating checksum with binary auxiliary files ([#1975](https://github.com/MetaMask/snaps/pull/1975))

## [3.0.2]

### Changed

- Use `@metamask/snaps-sdk` package ([#1951](https://github.com/MetaMask/snaps/pull/1951))
  - This package replaces the `@metamask/snaps-types` and
    `@metamask/snaps-ui` packages.

## [3.0.1]

### Changed

- Bump Babel packages from `^7.20.12` to `^7.23.2` ([#1862](https://github.com/MetaMask/snaps/pull/1862))
- Update multiple MetaMask dependencies ([#1841](https://github.com/MetaMask/snaps/pull/1841))

## [3.0.0]

### Changed

- **BREAKING:** Bump minimum Node.js version to `^18.16.0` ([#1741](https://github.com/MetaMask/snaps/pull/1741))

## [2.0.2]

### Fixed

- Fix Webpack being unable to find `swc-loader` in some cases ([#1798](https://github.com/MetaMask/snaps/pull/1798))
- Check minimum Node version in CLI ([#1797](https://github.com/MetaMask/snaps/pull/1797))

## [2.0.1]

### Fixed

- Disable the `fullySpecified` rule for `.js` imports in the default Webpack config ([#1780](https://github.com/MetaMask/snaps/pull/1780))

## [2.0.0]

### Changed

- Initial stable release from main branch ([#1757](https://github.com/MetaMask/snaps/pull/1757))

## [0.38.4-flask.1]

### Changed

- Bump `metamask/utils` and `metamask/snaps-registry` ([#1738](https://github.com/MetaMask/snaps/pull/1738), [#1694](https://github.com/MetaMask/snaps/pull/1694))

## [0.38.3-flask.1]

### Fixed

- Remove unused dependencies ([#1680](https://github.com/MetaMask/snaps/pull/1680))

## [0.38.2-flask.1]

### Added

- Add `polyfills` option to Webpack configuration ([#1650](https://github.com/MetaMask/snaps/pull/1650))

### Fixed

- Fix breaking change to SWC causing the CLI to break ([#1677](https://github.com/MetaMask/snaps/pull/1677))

## [0.38.1-flask.1]

### Changed

- Update all examples to use Webpack ([#1632](https://github.com/MetaMask/snaps/pull/1632))

## [0.38.0-flask.1]

### Added

- Add support for bundling with Webpack ([#1521](https://github.com/MetaMask/snaps/pull/1521))
  - For backwards compatibility, the Webpack bundler is opt-in. To use it, add
    `"bundler": "webpack"` to your snap configuration file, and follow the new
    configuration format described in the documentation.
  - The new configuration format also adds support for:
    - Setting environment variables, which are set as `process.env` values in
      the bundled code.
    - Importing WebAssembly modules (if `experimental.wasm` is enabled in the
      snap configuration file).
- Support TypeScript snap configuration files ([#1521](https://github.com/MetaMask/snaps/pull/1521))

### Changed

- Release package independently ([#1600](https://github.com/MetaMask/snaps/pull/1600))
  - The version of the package no longer needs to match the version of all other
    MetaMask Snaps packages.

[Unreleased]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@8.2.0...HEAD
[8.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@8.1.1...@metamask/snaps-cli@8.2.0
[8.1.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@8.1.0...@metamask/snaps-cli@8.1.1
[8.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@8.0.0...@metamask/snaps-cli@8.1.0
[8.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@7.2.0...@metamask/snaps-cli@8.0.0
[7.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@7.1.0...@metamask/snaps-cli@7.2.0
[7.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@7.0.0...@metamask/snaps-cli@7.1.0
[7.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@6.7.0...@metamask/snaps-cli@7.0.0
[6.7.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@6.6.1...@metamask/snaps-cli@6.7.0
[6.6.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@6.6.0...@metamask/snaps-cli@6.6.1
[6.6.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@6.5.4...@metamask/snaps-cli@6.6.0
[6.5.4]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@6.5.3...@metamask/snaps-cli@6.5.4
[6.5.3]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@6.5.2...@metamask/snaps-cli@6.5.3
[6.5.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@6.5.1...@metamask/snaps-cli@6.5.2
[6.5.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@6.5.0...@metamask/snaps-cli@6.5.1
[6.5.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@6.4.0...@metamask/snaps-cli@6.5.0
[6.4.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@6.3.4...@metamask/snaps-cli@6.4.0
[6.3.4]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@6.3.3...@metamask/snaps-cli@6.3.4
[6.3.3]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@6.3.2...@metamask/snaps-cli@6.3.3
[6.3.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@6.3.1...@metamask/snaps-cli@6.3.2
[6.3.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@6.3.0...@metamask/snaps-cli@6.3.1
[6.3.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@6.2.1...@metamask/snaps-cli@6.3.0
[6.2.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@6.2.0...@metamask/snaps-cli@6.2.1
[6.2.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@6.1.1...@metamask/snaps-cli@6.2.0
[6.1.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@6.1.0...@metamask/snaps-cli@6.1.1
[6.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@6.0.2...@metamask/snaps-cli@6.1.0
[6.0.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@6.0.1...@metamask/snaps-cli@6.0.2
[6.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@6.0.0...@metamask/snaps-cli@6.0.1
[6.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@5.1.1...@metamask/snaps-cli@6.0.0
[5.1.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@5.1.0...@metamask/snaps-cli@5.1.1
[5.1.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@5.0.0...@metamask/snaps-cli@5.1.0
[5.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@4.0.1...@metamask/snaps-cli@5.0.0
[4.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@4.0.0...@metamask/snaps-cli@4.0.1
[4.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@3.0.5...@metamask/snaps-cli@4.0.0
[3.0.5]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@3.0.4...@metamask/snaps-cli@3.0.5
[3.0.4]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@3.0.3...@metamask/snaps-cli@3.0.4
[3.0.3]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@3.0.2...@metamask/snaps-cli@3.0.3
[3.0.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@3.0.1...@metamask/snaps-cli@3.0.2
[3.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@3.0.0...@metamask/snaps-cli@3.0.1
[3.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@2.0.2...@metamask/snaps-cli@3.0.0
[2.0.2]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@2.0.1...@metamask/snaps-cli@2.0.2
[2.0.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@2.0.0...@metamask/snaps-cli@2.0.1
[2.0.0]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@0.38.4-flask.1...@metamask/snaps-cli@2.0.0
[0.38.4-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@0.38.3-flask.1...@metamask/snaps-cli@0.38.4-flask.1
[0.38.3-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@0.38.2-flask.1...@metamask/snaps-cli@0.38.3-flask.1
[0.38.2-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@0.38.1-flask.1...@metamask/snaps-cli@0.38.2-flask.1
[0.38.1-flask.1]: https://github.com/MetaMask/snaps/compare/@metamask/snaps-cli@0.38.0-flask.1...@metamask/snaps-cli@0.38.1-flask.1
[0.38.0-flask.1]: https://github.com/MetaMask/snaps/releases/tag/@metamask/snaps-cli@0.38.0-flask.1
