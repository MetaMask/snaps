# Changelog

## 0.4.1 (Current)

- Rename `plugin` option to `bundle`, but keep alias
- Bugfixes after renaming

## 0.4.0

- Rename package to `snaps-cli`
- Rename CLI entry point to `snap`
  - Maintain `mm-plugin` entry point alias and `mm-plugin.config.json` config files

## 0.3.13

- Fix fatal `watch` command bug

## 0.3.12

- Use existing `package.json` for `mm-plugin init`, if it exists
  - Fixes [#38](https://github.com/MetaMask/snaps-cli/issues/38)

## 0.3.11

- Stop publishing example builds to `npm`
- Add `buildExamples` script to `package.json`
  - Use this to build all examples with source maps
- Rename `build` and `watch` option `debug` to `sourceMaps`
  - Maintain `debug` alias for backwards compatibility

## 0.3.10

- Add optional source mapping via `debug` option to `build` and `watch` commands

## 0.3.9

- Fix `undefined` `port` in `package.json` on build
- The `populate` option for `mm-plugin manifest` (and `mm-plugin build`, which calls 
`manifest` by default) no longer has the alias `p`
  - `p` is now in every case reserved as an alias for `port`.

## 0.3.8

- Update readme

## 0.3.7

- `mm-plugin manifest` now populates `package.json:web3Wallet.bundle.url` using config values
  - It only does this if `bundle.url` is missing or starts with `http://localhost`.
  - It applies: `bundle.url = 'http://localhost:${port}/${bundlePath}'`
- Basic handling of HTML comment syntax in bundle
  - `<!--` and `-->` can be valid JavaScript, but are always forbidden by SES.
  They are now destructed into `<! --` and `-- >`. This may break code in some edge cases.

## 0.3.6

- Update faulty ignore files; package size decreased

## 0.3.5

- Updated examples to work with `metamask-plugin-beta` as of [this commit](https://github.com/MetaMask/metamask-plugin-beta/commit/b8ba321689cec6749502969f0084e12193e92dab)

## 0.3.4

- `mm-plugin watch` should no longer terminate on on parse or write errors

## 0.3.3

- Update `realms-shim`

## 0.3.2

- Handle SES edge cases
  - Babel: `regeneratorRuntime` global variable
  - Browserify: modules that use `Buffer`
    - Added regex that replaces lines in the bundle of the form `(function (Buffer){`

## 0.3.1

- Rename `.mm-plugin.json` to `mm-plugin.config.json`
  - Still support `.mm-plugin.json` for backwards compatibility

## 0.3.0

- Remove default command; at least one command must now be specified
- Add `init` command

## 0.2.1

- Specifying `web3Wallet.bundle.local` or `dist` in `.mm-plugin.json` no longer
overwrites the default for the `serve` command's `root` directory argument

## 0.2.0

- Use named rather than positional arguments
