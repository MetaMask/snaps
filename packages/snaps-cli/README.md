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
In the future, it will be possible to publish snaps on many different platforms, including
arbitrary npm registries and IPFS.

We recommend building your Snap using this tool.
You can bundle your Snap using your own tools, but it must run in SES and only
use the global APIs that MetaMask exposes at runtime.
Although Snaps currently execute in the browser, some browser APIs are not available for snaps, and Snaps do not have DOM access.

### The Snap Manifest

Your manifest must be named `snap.manifest.json` and located in the root directory of your npm package.
Here's an example manifest:

```json
{
  "version": "0.2.2",
  "proposedName": "@metamask/example-snap",
  "description": "An example snap.",
  "repository": {
    "type": "git",
    "url": "https://github.com/MetaMask/example-snap.git"
  },
  "source": {
    "shasum": "w3FltkDjKQZiPwM+AThnmypt0OFF7hj4ycg/kxxv+nU=",
    "location": {
      "npm": {
        "filePath": "dist/bundle.js",
        "packageName": "@metamask/example-snap",
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
├─ index.js
├─ snap.manifest.json
├─ dist/
│  ├─ bundle.js
├─ ... (all other project files and folders)
```

Source files other than `index.js` are located through its imports.
The defaults can be overwritten using the `snap.config.json` config file,
[see below](#configuration-file).

## Usage

`snap --help`

```text
Usage: snap <command> [options]

Commands:
  snap init      Initialize Snap package                     [aliases: i]
  snap build     Build Snap from source                      [aliases: b]
  snap eval      Attempt to evaluate Snap bundle in SES      [aliases: e]
  snap manifest  Validate project package.json as a Snap manifest
                                                                    [aliases: m]
  snap serve     Locally serve Snap file(s) for testing      [aliases: s]
  snap watch     Build Snap on change                        [aliases: w]

Options (build):
  --help, -h                      Show help                            [boolean]
  --src, -s                       Source file
                                       [string] [required] [default: "index.js"]
  --dist, -d                      Output directory
                                          [string] [required] [default: "dist/"]
  --outfileName, -n               Output file name
                                                 [string] [default: "bundle.js"]
  --sourceMaps                    Whether building outputs sourcemaps
                                                      [boolean] [default: false]
  --stripComments, --strip        Whether to remove code comments from bundle
                                                      [boolean] [default: false]
  --port, -p                      Local server port for testing
                                             [number] [required] [default: 8081]
  --eval, -e                      Attempt to evaluate Snap bundle in SES
                                                       [boolean] [default: true]
  --manifest, -m                  Validate project package.json as a Snap
                                  manifest             [boolean] [default: true]
  --populate                      Update Snap manifest properties of
                                  package.json         [boolean] [default: true]
  --verboseErrors, -v, --verbose  Display original errors
                                                      [boolean] [default: false]
  --suppressWarnings, -w          Suppress warnings   [boolean] [default: false]

Examples:
  snap init                            Initialize Snap package from
                                            scratch
  snap build -s index.js -d out        Build 'Snap.js' as
                                            './out/bundle.js'
  snap build -s index.js -d out -n     Build 'Snap.js' as
  Snap.js                                 './out/Snap.js'
  snap serve -r out                    Serve files in './out' on port 8080
  snap serve -r out -p 9000            Serve files in './out' on port 9000
  snap watch -s index.js -d out        Rebuild './out/bundle.js' on changes
                                            to files in 'index.js' parent and
                                            child directories
```

### Configuration File

`snap.config.json` can be placed in the project root directory. It should have string keys matching
command arguments. Values become argument defaults, which can still be overriden on the command line.
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
    - `test/` and `tests/`
    - The specified `dist` directory
    - Dotfiles
  - `serve --root ... --port ...` serves the `root` directory on `localhost:port`
    - By default, `root` serves the current working directory: `.`
- Arguments
  - `src`, `snap`, and `outfileName` must be file paths when specified
  - `dist` and `root` must be directory paths when specified
