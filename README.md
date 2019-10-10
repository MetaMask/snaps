# MetaMask Plugin Utility

A CLI tool for building MetaMask plugins.

## Installation

Always use `node@10.16.3`, the version currently used to develop MetaMask.

1. `git clone git@github.com:MetaMask/mm-plugin.git`
2. `cd mm-plugin`
3. `npm install -g .`

## Basic Usage

```bash
mkdir myPlugin
cd myPlugin
mm-plugin init
```

## MetaMask Plugins

MetaMask plugins consist of two things: a JSON manifest and a JavaScript bundle.
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
  - `initialPermissions` (`{ string: object }`; permissions
  to be requested on plugin installation)
    - See [this interface](https://github.com/MetaMask/json-rpc-capabilities-middleware#requestpermissions-irequestedpermissions)
    and examples in this repo for details.

If you exclude any required fields from `package.json`, your plugin may not
work properly or install at all.

We recommend building your plugin using this tool.
You can bundle your plugin using your own tools, but it must run in the browser,
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
The defaults can be overwritten using the `mm-plugin.config.json` config file,
[see below](#configuration-file).

### Permissions

This module uses permissions as defined in [`json-rpc-capabilities-middleware`
or `rpc-cap`](https://github.com/MetaMask/json-rpc-capabilities-middleware).
See examples in this repo for details.

## Usage

Always use `node@10.16.3`, the version currently used to develop MetaMask.

`mm-plugin --help`
```
Usage: mm-plugin [command] [options]

Commands:                                                                                    
  mm-plugin init      Initialize plugin package                     [aliases: i]
  mm-plugin build     Build plugin from source                      [aliases: b]
  mm-plugin eval      Call 'eval' on plugin bundle to ensure it works                        
                                                                    [aliases: e]
  mm-plugin manifest  Validate project package.json as a plugin manifest                     
                                                                    [aliases: m]
  mm-plugin serve     Locally serve plugin file(s)                  [aliases: s]             
  mm-plugin watch     Build file(s) on change                       [aliases: w]

Options (build):
  --version               Show version number                          [boolean]
  --verboseErrors, -v     Display original errors     [boolean] [default: false]
  --suppressWarnings, -w  Suppress warnings           [boolean] [default: false]
  --help, -h              Show help                                    [boolean]
  --src, -s               Source file  [string] [required] [default: "index.js"]
  --dist, -d              Output directory
                                          [string] [required] [default: "dist"]
  --outfileName, -n      Output file name                              [string]
  --eval, -e              Call 'eval' on plugin bundle to ensure it works
                                                       [boolean] [default: true]
  --manifest, -m          Validate project package.json as a plugin manifest
                                                       [boolean] [default: true]
  --populate, -p          Update plugin manifest properties of package.json
                                                       [boolean] [default: true]

Examples:
  mm-plugin init                            Initialize plugin package from
                                            scratch
  mm-plugin build -s index.js -d out        Build 'plugin.js' as
                                            './out/bundle.js'
  mm-plugin build -s index.js -d out -n     Build 'plugin.js' as
  plugin.js                                 './out/plugin.js'
  mm-plugin serve -r out                    Serve files in './out' on port 8080
  mm-plugin serve -r out -p 9000            Serve files in './out' on port 9000
  mm-plugin watch -s index.js -d out        Rebuild './out/bundle.js' on changes
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
  - `src`, `plugin`, and `outfileName` must be file paths when specified
  - `dist` and `root` must be directory paths when specified

### Configuration File

`mm-plugin.config.json` can be placed in the project root directory. It should have string keys matching
command arguments. Values become argument defaults, which can still be overriden on the command line.
Example:
```json
{
  "src": "src",
  "dist": "plugins",
  "port": 9000
}
```
