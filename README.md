# MetaMask Plugin Utility

## Usage

To create a JSON file that can be served to metamask as a plugin manifest:

```
npm install
touch new-plugin.js
npm link
mm-plugin new-plugin.js new-plugin.bundled.json
```

**Input:**
```
// example1.js

(() => {
  ethereum.onNewTx(txMeta => {
    let state = ethereum.getPluginState()
    ethereum.updatePluginState({  [txMeta.txParams.from]: state[txMeta.txParams.from] + 1 })
    state = ethereum.getPluginState()
    console.log('Number of transactions sent by address', JSON.stringify(state, null, 2));
  })
})
```

**Output:**
```
// example1.bundled.json
{
  "sourceCode": "(() => {\n  ethereum.onNewTx(txMeta => {\n    let state = ethereum.getPluginState()\n    ethereum.updatePluginState({  [txMeta.txParams.from]: state[txMeta.txParams.from] + 1 })\n    state = ethereum.getPluginState()\n    console.log('Number of transactions sent by address', JSON.stringify(state, null, 2));\n  })\n})\n",
  "requestedPermissions": {
    "onNewTx": {},
    "getPluginState": {},
    "updatePluginState": {}
  }
}
```

### CLI

`mm-plugin --help`
```
Usage: mm-plugin [command] [options]

Commands:
  mm-plugin build [src] [dest]   build plugin file(s) from source
                                                          [default] [aliases: b]
  mm-plugin watch [src] [dest]   rebuild file(s) on change          [aliases: w]
  mm-plugin serve [root] [port]  locally serve plugin file(s)       [aliases: s]

Positional arguments:
  src   source file or directory                                        [string]
  dest  output file or directory                                        [string]
  root  server root directory                                           [string]
  port  server port                                     [number] [default: 8080]

Options:
  --version      Show version number                                   [boolean]
  -v, --verbose  Display original errors.                              [boolean]
  -h, --help     Show help                                             [boolean]

Examples:
  mm-plugin plugin.js ./out    Build 'plugin.js' as './out/plugin.json'.
  mm-plugin serve ./out        Serve files in './out' on port 8080.
  mm-plugin serve ./out 9000   Serve files in './out' on port 9000.
  mm-plugin watch ./src ./out  Rebuild files in './src' to './out' on change.
```

#### Usage Notes
- `src` and `dest` arguments for building and watching can take the following forms:
    - `[file] [file]`
    - `[file] [directory]`
    - `[directory] [directory]`

- If `src` is a directory, non-`.js` files will be ignored. Passing a non-`.js`
file will cause an error to be thrown.

- If `dest` is a file, it must end with `.json`.

- If `dest` is a directory, the output file(s) will retain the source file names except
for the extension:
    - `someFile.js` -> `someFile.json`

#### Configuration Using `.mm-plugin.json`
A config file placed in the current working directory, with string keys matching command
arguments. Values become argument defaults, which can be overriden on the command line.
Example:
```json
{
  "src": "./src",
  "dest": "./plugins",
  "port": 9000
}
```
Here, `dest` also becomes the default for the server `root`. Specify `root` in the config
to override this behavior.
