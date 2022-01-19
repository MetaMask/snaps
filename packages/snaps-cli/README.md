# @metamask/snaps-cli

A CLI for developing MetaMask Snaps.

## Installation

Use Node.js `12.11.0` or later.
We recommend [nvm](https://github.com/nvm-sh/nvm) for managing Node.js versions.

- `yarn global add snaps-cli`

## Basic Usage

```bash
mkdir mySnap
cd mySnap
mm-snap init
```

## MetaMask Snaps

MetaMask Snaps enables trustlessly extending the functionality of MetaMask at runtime.
A Snap consist of two things: a JSON manifest and a JavaScript bundle.
At present, Snaps can be published as npm packages on the public npm registry, or hosted locally during development.
In the future, it will be possible to publish snaps on many different platforms, including arbitrary npm registries and IPFS.

We recommend building your Snap using this tool.
You can bundle your Snap using your own tools, but it must run in SES and only use the global APIs that MetaMask exposes at runtime.
Although Snaps currently execute in the browser, some browser APIs are not available to Snaps, and Snaps do not have DOM access.

### The Snap Manifest

Your manifest must be named `snap.manifest.json` and located in the root directory of your npm package.
Here's an example manifest:

```json
{
  "version": "0.7.0",
  "proposedName": "@metamask/template-snap",
  "description": "A MetaMask Snap template.",
  "repository": {
    "type": "git",
    "url": "https://github.com/MetaMask/template-snap.git"
  },
  "source": {
    "shasum": "w3FltkDjKQZiPwM+AThnmypt0OFF7hj4ycg/kxxv+nU=",
    "location": {
      "npm": {
        "filePath": "dist/bundle.js",
        "iconPath": "images/icon.svg",
        "packageName": "@metamask/template-snap",
        "registry": "https://registry.npmjs.org/"
      }
    }
  },
  "initialPermissions": {
    "snap_confirm": {}
  },
  "manifestVersion": "0.1"
}
```

Refer to [the Snaps publishing specification](https://github.com/MetaMask/specifications/blob/main/snaps/publishing.md) and the [manifest JSON schema](https://github.com/MetaMask/specifications/blob/main/snaps/schemas/snap-manifest.schema.json) for details.

> **ATTN:** If your Snap is not compatible with the publishing specification, your Snap may not work properly or install at all.

### Assumed Project Structure

This tool has default arguments assuming the following project structure:

```text
snap-project/
├─ package.json
├─ src/
│  ├─ index.js
├─ snap.manifest.json
├─ dist/
│  ├─ bundle.js
├─ ... (all other project files and folders)
```

Source files other than `index.js` are located through its imports.
The defaults can be overwritten using the `snap.config.json` config file,
[see below](#configuration-file).

## Usage

Run `mm-snap --help` for usage instructions.

### Configuration File

`snap.config.json` can be placed in the project root directory. It should have string keys matching command arguments.
Values become argument defaults, which can still be overriden on the command line.
Example:

```json
{
  "src": "lib",
  "dist": "out",
  "port": 9000
}
```

The configuration file should not be published.

### Gotchas

- Commands
  - `watch --src ... --dist ...` rebuilds on all changes in the parent directory
    of `src` and its children except:
    - `node_modules/`
    - `test/`, `tests/`, `**/*.test.js`, and `**/*.test.ts`
    - The specified `dist` directory
    - Dotfiles
  - `serve --root ... --port ...` serves the `root` directory on `localhost:port`
    - By default, `root` serves the current working directory: `.`
- Arguments
  - `src` must be a file path when specified
  - `dist` and `root` must be directory paths when specified
