# Changelog

## 0.3.3 (Current)

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
