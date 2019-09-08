# MetaMask Plugin Utility

## Usage

To create a JSON file that can be served to metamask as a plugin manifest:

```
npm install
touch new-plugin.js
npm link
mm-plugin example1.js example1.bundled.json
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

`mm-plugin --help` will display a list of available commands and their default
parameters.

Plugin files can be served locally for testing using `mm-plugin serve`.

`src` and `dest` arguments for building and watching can take the following forms:
- `[file] [file]`
- `[file] [directory]`
- `[directory] [directory]`

If `src` is a directory, non-`.js` files will be ignored. Passing a non-`.js`
file will cause an error to be thrown.

If `dest` is a directory, the output file(s) will have the same names as the
input files but with a different extension:
- `someFile.js` -> `someFile.json`
