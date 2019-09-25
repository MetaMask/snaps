# MetaMask Plugin Utility

A CLI tool for building MetaMask plugins.

## Basic Usage

Ensure that you are using `node@^10.16.3`.

```bash
mkdir myPlugin
cd myPlugin
npm init
touch index.js
mm-plugin
```

This will build to `myPlugin/dist/bundle.js` from `index.js` and its dependencies,
and attempt to set the custom properties on `package.json`.

## MetaMask Plugins

MetaMask plugins consist of two things: a JSON manifest and a JavaScript bundle.
For a variety of reasons, we decided to follow NPM conventions. Thus, the manifest file
is simply `package.json`, with the following required standard fields:
- `name`
- `version`
- `description`
- `main` (relative path to source entry point, not the bundle)
- `repository`

In addition, we use the following custom fields:
- `web3Wallet` (**required**; object)
  - `bundle` (**required**; object)
    - `local` (**required**; string; relative path to bundle)
    - `url` (*optional*; string; absolute URL to bundle)
  - `initialPermissions` (*optional*; object{ string: object } permissions
  to be requested on install)
    - See [this interface](https://github.com/MetaMask/json-rpc-capabilities-middleware#requestpermissions-irequestedpermissions)
    and examples in this repo for details.

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
The defaults can be overwritten using the `.mm-plugin.json` config file,
[see below](#configuration-file).

### Permissions

This module uses permissions as defined in [`json-rpc-capabilities-middleware`
or `rpc-cap`](https://github.com/MetaMask/json-rpc-capabilities-middleware).
See examples in this repo for details.

## Usage

`mm-plugin --help`
```
Usage: mm-plugin [command] [options]

Commands:                                                                                    
  mm-plugin build     Build plugin from source            [default] [aliases: b]
  mm-plugin eval      Call 'eval' on plugin bundle to ensure it works                        
                                                                    [aliases: e]
  mm-plugin manifest  Validate project package.json as a plugin manifest                     
                                                                    [aliases: m]
  mm-plugin serve     Locally serve plugin file(s)                  [aliases: s]             
  mm-plugin watch     Build file(s) on change                       [aliases: w]

Options (build):
  --version           Show version number                              [boolean]
  --verbose, -v       Display original errors                          [boolean]
  --help, -h          Show help                                        [boolean]
  --src, -s           Source file      [string] [required] [default: "index.js"]
  --dist, -d          Output directory    [string] [required] [default: "dist/"]
  --outfile-name, -n  Output file name                                  [string]
  --eval, -e          Call 'eval' on plugin bundle to ensure it works
                                                       [boolean] [default: true]
  --manifest, -m      Validate project package.json as a plugin manifest
                                                       [boolean] [default: true]
  --populate, -p      Update plugin manifest properties of package.json
                                                       [boolean] [default: true]

Examples:
  mm-plugin -s index.js -d out              Build 'plugin.js' as
                                            './out/bundle.js'
  mm-plugin -s index.js -d out -n           Build 'plugin.js' as
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
- Arguments
  - `src` must be a file
  - `dist` must be a directory

### Configuration File
`.mm-config.json` can be placed in the project root directory. It should have string keys matching
command arguments. Values become argument defaults, which can still be overriden on the command line.
Example:
```json
{
  "src": "src",
  "dist": "plugins",
  "port": 9000
}
```
Here, `dist` also becomes the default for the server `root`. Specify `root` in the config
to override this behavior.
