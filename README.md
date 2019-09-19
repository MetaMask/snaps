# MetaMask Plugin Utility

A CLI tool for building MetaMask plugins.

## Basic Usage

```bash
mkdir myPlugin
cd myPlugin
npm init
touch index.js
mm-plugin
```

This will build to `myPlugin/dist/bundle.js` from `index.js` and its dependencies,
and attempt to set the required custom properties on `package.json`.

## MetaMask Plugins

MetaMask plugins consist of two things: a JSON manifest and a JavaScript bundle.
For a variety of reasons, we decided to follow NPM conventions. Thus, the manifest file
is simply `package.json`, with the following required standard fields:
- `name`
- `version`
- `description`
- `main` (relative path to source entry point, not the bundle)
- `repository`

In addition, we require the following custom fields:
- `web3Wallet` (object)
  - `bundle` (string; relative path to bundle)
  - `requiredPermissions` (string array; required permission names)

Your plugin bundle must be built using the build config of this tool.

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

TODO

## Usage

`mm-plugin --help`
```
Usage: mm-plugin [command] [options]

Commands:
  mm-plugin build [src] [dist]   Build plugin from source [default] [aliases: b]
  mm-plugin eval [plugin]        Evaluate plugin bundle in SES      [aliases: e]
  mm-plugin manifest [src]       Add plugin manifest properties to package.json
                                                                    [aliases: m]
  mm-plugin serve [root] [port]  Locally serve plugin file(s)       [aliases: s]
  mm-plugin watch [src] [dist]   Build file(s) on change            [aliases: w]

Positionals:
  src   Source file                               [string] [default: "index.js"]
  dist  Output directory                              [string] [default: "dist"]
  root  Server root directory                            [string] [default: "."]
  port  Server port                                     [number] [default: 8080]
  plugin  Plugin bundle                     [string] [default: "dist/bundle.js"]

Options:
  --version           Show version number                              [boolean]
  --verbose, -v       Display original errors                          [boolean]
  --help, -h          Show help                                        [boolean]
  --outfile-name, -n  Output file name                                  [string]
  --manifest, -m      Add plugin manifest properties to package.json
                                                       [boolean] [default: true]

Examples:
  mm-plugin index.js out               Build 'plugin.js' as './out/bundle.js'
  mm-plugin index.js out -n plugin.js  Build 'plugin.js' as './out/plugin.js'
  mm-plugin serve out                  Serve files in './out' on port 8080
  mm-plugin serve out 9000             Serve files in './out' on port 9000
  mm-plugin watch index.js out         Rebuild './out/bundle.js' on changes to
                                       files in 'index.js' parent and child
                                       directories]
```

### Usage Notes
- Commands
  - `watch [src] [dist]` rebuilds on all changes in the parent and child directories of `src`,
  except:
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
