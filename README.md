# `snaps-cli`

A CLI for developing MetaMask Snaps, formerly known as "plugins."

## Installation

Always use `node@10.16.3`, the version currently used to develop MetaMask.
We recommend [NVM](https://github.com/nvm-sh/nvm) for managing Node versions.

To install and access the examples (recommended):

1. `git clone git@github.com:MetaMask/snaps-cli.git`
2. `cd snaps-cli`
3. `npm link`

You can also simply install globally: `npm install -g snaps-cli`


## Basic Usage

```bash
mkdir mySnap
cd mySnap
snap init
```

There is also an alias `mm-snap` in case of `snap` being taken.

## MetaMask Snaps

MetaMask Snaps consist of two things: a JSON manifest and a JavaScript bundle.
For a variety of reasons, we decided to follow NPM conventions. Thus, the manifest file
is simply `package.json`, with the following required standard fields:
- `name`
- `version`
- `description`
- `main` (relative path to source entry point, not the bundle)
- `repository`

In addition, we use the following, required custom fields:
- `web3Wallet` (`object`)
  - `bundle` (`object`)
    - `local` (`string`; relative path to bundle)
    - `url` (`string`; absolute URL to bundle)
      - Set to e.g. `localhost:8081/dist/bundle.js` for local development.
  - `initialPermissions` (`{ string: object }`; permissions to be requested on
  Snap installation)
    - See [this interface](https://github.com/MetaMask/rpc-cap#requestpermissions-irequestedpermissions)
    and examples in this repo for details.

If you exclude any required fields from `package.json`, your Snap may not
work properly or install at all.

We recommend building your Snap using this tool.
You can bundle your Snap using your own tools, but it must run in the browser,
run in SES, and its contents must be wrapped in an anonymous function (`() => ( ... )`).

### Assumed Project Structure

This tool has default arguments assuming the following project structure:
```
 .
 |- index.js
 |- dist/
 |-- bundle.js
 |- ... (all other project files and folders)
```
Source files other than `index.js` are located through its imports.
The defaults can be overwritten using the `snap.config.json` config file,
[see below](#configuration-file).

### Permissions

This module uses permissions as defined in [`rpc-cap`, MetaMask's JSON RPC
capabilities middleware](https://github.com/MetaMask/rpc-cap).
See examples in this repo for details.

## Usage

Always use `node@10.16.3`, the version currently used to develop MetaMask.

`snap --help`
```
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

### Usage Notes

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
