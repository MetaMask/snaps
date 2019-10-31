# Changelog

## 0.3.8 (Current)

- Update readme

## 0.3.7

- `mm-plugin manifest` now populates `package.json:web3Wallet.bundle.url` using config values
  - It only does this if `bundle.url` is missing or starts with `http://localhost`.
  - It applies: `bundle.url = 'http://localhost:${port}/${bundlePath}'`
- Basic handling of HTML comment syntax in bundle
  - `<!--` and `-->` are valid JavaScript, but disallowd by SES. They are now destructed into `<! --` and `-- >`.
  - This may break code in some edge cases, but SES will never evaluate code with either token.

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
