# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.38.2-flask.1]
### Uncategorized
- Use depcheck to lint dependencies ([#1680](https://github.com/MetaMask/snaps-skunkworks.git/pull/1680))
- Remove unused deps ([#1674](https://github.com/MetaMask/snaps-skunkworks.git/pull/1674))
- Fix CLI usage of SWC ([#1677](https://github.com/MetaMask/snaps-skunkworks.git/pull/1677))
- Add `polyfills` option to Webpack configuration ([#1650](https://github.com/MetaMask/snaps-skunkworks.git/pull/1650))
- Fix SES dependencies ([#1660](https://github.com/MetaMask/snaps-skunkworks.git/pull/1660))

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

[Unreleased]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-cli@0.38.2-flask.1...HEAD
[0.38.2-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-cli@0.38.1-flask.1...@metamask/snaps-cli@0.38.2-flask.1
[0.38.1-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/compare/@metamask/snaps-cli@0.38.0-flask.1...@metamask/snaps-cli@0.38.1-flask.1
[0.38.0-flask.1]: https://github.com/MetaMask/snaps-skunkworks.git/releases/tag/@metamask/snaps-cli@0.38.0-flask.1
