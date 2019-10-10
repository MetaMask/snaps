# Changelog

## 0.3.1 (Current)

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
