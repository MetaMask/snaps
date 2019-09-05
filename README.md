Usage:

To create a json file that can be served to metamask as a plugin manifest:

```
npm install
touch new-plugin.js
npm link
mm-plugin build example1.js -o example1.bundled.json
```

Input:
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

Output:
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